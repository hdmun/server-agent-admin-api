import * as hash from './ntlm.hash'
import * as os from 'os'

const NTLMFLAG_NEGOTIATE_OEM = 1 << 1;
const NTLMFLAG_REQUEST_TARGET = 1 << 2;
const NTLMFLAG_NEGOTIATE_NTLM_KEY = 1 << 9;
const NTLMFLAG_NEGOTIATE_ALWAYS_SIGN = 1 << 15;
const NTLMFLAG_NEGOTIATE_NTLM2_KEY = 1 << 19;
const NTLMFLAG_NEGOTIATE_TARGET_INFO = 1 << 23;

const NTLMSIGNATURE = "NTLMSSP\0";

interface NtlmType2TargetInfo {
  parsed: { [key: string]: string }
  buffer: Buffer
}

export interface NtlmType2Message {
  flags: number
  encoding: BufferEncoding
  version: number
  challenge: Buffer
  targetName?: string
  targetInfo?: NtlmType2TargetInfo
}

export function createType1Message(workstation: string, domain: string): string {
  let pos = 0;
  // signature
  const buf = Buffer.alloc(1024);
  buf.write(NTLMSIGNATURE, pos, NTLMSIGNATURE.length, 'ascii'); pos += NTLMSIGNATURE.length;

  // message type
  buf.writeUInt32LE(1, pos); pos += 4;

  // flags
  buf.writeUInt32LE(
    NTLMFLAG_NEGOTIATE_OEM
    | NTLMFLAG_REQUEST_TARGET
    | NTLMFLAG_NEGOTIATE_NTLM_KEY
    | NTLMFLAG_NEGOTIATE_NTLM2_KEY
    | NTLMFLAG_NEGOTIATE_ALWAYS_SIGN, pos); pos += 4;

  // domain security buffer
  buf.writeUInt16LE(domain.length, pos); pos += 2;
  buf.writeUInt16LE(domain.length, pos); pos += 2;
  let dataPos = 32;
  buf.writeUInt32LE(domain.length === 0 ? 0 : dataPos, pos); pos += 4;

  if (domain.length > 0) {
    dataPos += buf.write(domain, dataPos, 'ascii');
  }

  // workstation security buffer
  buf.writeUInt16LE(workstation.length, pos); pos += 2;
  buf.writeUInt16LE(workstation.length, pos); pos += 2;
  buf.writeUInt32LE(workstation.length === 0 ? 0 : dataPos, pos); pos += 4;

  if (workstation.length > 0) {
    dataPos += buf.write(workstation, dataPos, 'ascii');
  }

  return 'NTLM ' + buf.toString('base64', 0, dataPos);
}

export function decodeType2Message(str) {
  if (str === undefined) {
    throw new Error('Invalid argument');
  }

  // convenience
  if (Object.prototype.toString.call(str) !== '[object String]') {
    if (str.hasOwnProperty('headers') && str.headers.hasOwnProperty('www-authenticate')) {
      str = str.headers['www-authenticate'];
    } else {
      throw new Error('Invalid argument');
    }
  }

  const ntlmMatch = /^NTLM ([^,\s]+)/.exec(str);
  if (ntlmMatch) {
    str = ntlmMatch[1];
  }

  const buf = Buffer.from(str, 'base64');
  // check signature
  if (buf.toString('ascii', 0, NTLMSIGNATURE.length) !== NTLMSIGNATURE) {
    throw new Error('Invalid message signature: ' + str);
  }

  // check message type
  if (buf.readUInt32LE(NTLMSIGNATURE.length) !== 2) {
    throw new Error('Invalid message type (no type 2)');
  }

  // read flags
  const flags = buf.readUInt32LE(20);
  const obj: NtlmType2Message = {
    flags: flags,
    encoding: (flags & NTLMFLAG_NEGOTIATE_OEM) ? 'ascii' : 'ucs2',
    version: (flags & NTLMFLAG_NEGOTIATE_NTLM2_KEY) ? 2 : 1,
    challenge: buf.slice(24, 32)
  }

  // read target name
  obj.targetName = (function () {
    const length = buf.readUInt16LE(12);
    // skipping allocated space
    const offset = buf.readUInt32LE(16);

    if (length === 0) {
      return '';
    }

    if ((offset + length) > buf.length || offset < 32) {
      throw new Error('Bad type 2 message');
    }

    return buf.toString(obj.encoding, offset, offset + length);
  })();

  // read target info
  if (obj.flags & NTLMFLAG_NEGOTIATE_TARGET_INFO) {
    obj.targetInfo = (function () {
      const length = buf.readUInt16LE(40);
      const offset = buf.readUInt32LE(44);  // skipping allocated space

      const info = {
        parsed: {},
        buffer: Buffer.alloc(length)
      };
      buf.copy(info.buffer, 0, offset, offset + length);

      if (length === 0) {
        return info;
      }

      if ((offset + length) > buf.length || offset < 32) {
        throw new Error('Bad type 2 message');
      }

      let pos = offset;
      while (pos < (offset + length)) {
        const blockType = buf.readUInt16LE(pos); pos += 2;
        const blockLength = buf.readUInt16LE(pos); pos += 2;
        if (blockType === 0) {
          // reached the terminator subblock
          break;
        }

        let blockTypeStr;
        switch (blockType) {
          case 1: blockTypeStr = 'SERVER'; break;
          case 2: blockTypeStr = 'DOMAIN'; break;
          case 3: blockTypeStr = 'FQDN'; break;
          case 4: blockTypeStr = 'DNS'; break;
          case 5: blockTypeStr = 'PARENT_DNS'; break;
          default: blockTypeStr = ''; break;
        }

        if (blockTypeStr) {
          info[blockTypeStr] = buf.toString('ucs2', pos, pos + blockLength);
        }

        pos += blockLength;
      }

      return info
    })();
  }

  return obj;
}

export function createType3Message(type2Message, username: string, password: string, workstation: string, domain: string) {

  if (workstation === undefined) workstation = os.hostname();
  if (domain === undefined) domain = type2Message.targetName;

  const buf = Buffer.alloc(1024);
  buf.write(NTLMSIGNATURE, 0, NTLMSIGNATURE.length, 'ascii');  // signature
  buf.writeUInt32LE(3, 8);  // message type

  let dataPos = 52;
  if (type2Message.version === 2) {
    dataPos = 64;

    const ntlmHash = hash.createNTLMHash(password);
    const nonce = hash.createPseudoRandomValue(16);
    const lmv2 = hash.createLMv2Response(type2Message, username, ntlmHash, nonce, domain);
    const ntlmv2 = hash.createNTLMv2Response(type2Message, username, ntlmHash, nonce, domain);

    // lmv2 security buffer
    buf.writeUInt16LE(lmv2.length, 12);
    buf.writeUInt16LE(lmv2.length, 14);
    buf.writeUInt32LE(dataPos, 16);

    lmv2.copy(buf, dataPos);
    dataPos += lmv2.length;

    // ntlmv2 security buffer
    buf.writeUInt16LE(ntlmv2.length, 20);
    buf.writeUInt16LE(ntlmv2.length, 22);
    buf.writeUInt32LE(dataPos, 24);

    ntlmv2.copy(buf, dataPos);
    dataPos += ntlmv2.length;
  } else {
    const lmHash = hash.createLMHash(password);
    const ntlmHash = hash.createNTLMHash(password);
    const lm = hash.createLMResponse(type2Message.challenge, lmHash);
    const ntlm = hash.createNTLMResponse(type2Message.challenge, ntlmHash);

    // lm security buffer
    buf.writeUInt16LE(lm.length, 12);
    buf.writeUInt16LE(lm.length, 14);
    buf.writeUInt32LE(dataPos, 16);

    lm.copy(buf, dataPos);
    dataPos += lm.length;

    // ntlm security buffer
    buf.writeUInt16LE(ntlm.length, 20);
    buf.writeUInt16LE(ntlm.length, 22);
    buf.writeUInt32LE(dataPos, 24);

    ntlm.copy(buf, dataPos);
    dataPos += ntlm.length;
  }

  // target name security buffer
  buf.writeUInt16LE(type2Message.encoding === 'ascii' ? domain.length : domain.length * 2, 28);
  buf.writeUInt16LE(type2Message.encoding === 'ascii' ? domain.length : domain.length * 2, 30);
  buf.writeUInt32LE(dataPos, 32);

  dataPos += buf.write(domain, dataPos, type2Message.encoding);

  // user name security buffer
  buf.writeUInt16LE(type2Message.encoding === 'ascii' ? username.length : username.length * 2, 36);
  buf.writeUInt16LE(type2Message.encoding === 'ascii' ? username.length : username.length * 2, 38);
  buf.writeUInt32LE(dataPos, 40);

  dataPos += buf.write(username, dataPos, type2Message.encoding);

  // workstation name security buffer
  buf.writeUInt16LE(type2Message.encoding === 'ascii' ? workstation.length : workstation.length * 2, 44);
  buf.writeUInt16LE(type2Message.encoding === 'ascii' ? workstation.length : workstation.length * 2, 46);
  buf.writeUInt32LE(dataPos, 48);

  dataPos += buf.write(workstation, dataPos, type2Message.encoding);

  if (type2Message.version === 2) {
    // session key security buffer
    buf.writeUInt16LE(0, 52);
    buf.writeUInt16LE(0, 54);
    buf.writeUInt32LE(0, 56);

    buf.writeUInt32LE(type2Message.flags, 60);  // flags
  }

  return 'NTLM ' + buf.toString('base64', 0, dataPos);
}
