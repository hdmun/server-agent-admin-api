USE [ServerAgent]
GO

TRUNCATE TABLE [dbo].[HostServer]
GO

INSERT INTO [dbo].[HostServer] ([HostName], [IPAddr])
    VALUES ('LAPTOP-PR4G61PI', '127.0.0.1'),
           ('DESKTOP-UNOS40A', '172.28.240.1')
GO
