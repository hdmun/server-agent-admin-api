import axios, { AxiosError, AxiosResponse } from 'axios'
import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import { createType1Message, createType3Message, decodeType2Message } from './ntlm.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [HttpModule],
  exports: [HttpModule],
})
export class NtlmModule extends HttpModule implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    super();
  }

  public onModuleInit(): any {
    const axiosRef = this.httpService.axiosRef;

    axiosRef.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        if (!axios.isAxiosError(error)) {
          throw error
        }

        const response = error.response
        if (!response) {
          throw error
        }
        if (response.status !== 401) {  // not Unauthorized
          throw error
        }

        const authHeader = response.headers['www-authenticate']
        if (!authHeader) {
          throw error
        }

        if (!authHeader.includes('NTLM')) {
          throw error
        }

        const hostname = error.config.headers['hostname'] as string
        const domain = this.configService.get<string>('NTLM_DOMAIN')

        if (authHeader === 'Negotiate, NTLM') {
          const t1Msg = createType1Message(hostname, domain);
          response.config.headers["Authorization"] = t1Msg;
          return axios(response.config)
        }

        const hash = (authHeader.match(/^NTLM\s+(.+?)(,|\s+|$)/) || [])[1]
        const t2MsgObj = decodeType2Message(hash)

        const username = this.configService.get<string>('NTLM_USER')
        const password = this.configService.get<string>('NTLM_PASSWORD')
        const t3Msg = createType3Message(t2MsgObj, username, password, hostname, domain);

        response.config.headers["X-retry"] = "false";
        response.config.headers["Authorization"] = t3Msg;

        return axios(response.config)
      },
    );
  }
}