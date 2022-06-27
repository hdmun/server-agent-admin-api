import ServerApp from './app'

;(async () => {
  const app = new ServerApp()
  await app.start()
})()

// const server = new ServerApp()
// server.setup()
// export default {
//   path: '/api',
//   handler: server.app
// }
