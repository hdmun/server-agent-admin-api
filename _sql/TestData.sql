USE [ServerAgent]
GO

TRUNCATE TABLE [dbo].[HostServer]
GO

INSERT INTO [dbo].[HostServer] ([HostName], [IPAddr])
    VALUES ('LAPTOP-PR4G61PI', '127.0.0.1'),
           ('DESKTOP-UNOS40A', '172.28.240.1')
GO


TRUNCATE TABLE [dbo].[ServerProcess]
GO

INSERT INTO [dbo].[ServerProcess] ([HostName], [ServerName], [ProcessPath])
    VALUES ('LAPTOP-PR4G61PI', 'TestServer1', '.\TestServer.exe'),
           ('LAPTOP-PR4G61PI', 'TestServer2', '.\TestServer.exe'),
           ('DESKTOP-UNOS40A', 'TestServer1', '.\TestServer.exe'),
           ('DESKTOP-UNOS40A', 'TestServer2', '.\TestServer.exe')
GO
