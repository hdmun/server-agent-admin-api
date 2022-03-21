USE [ServerAgent]
GO

IF OBJECT_ID('[dbo].[HostServer]') IS NOT NULL
	DROP TABLE [dbo].[HostServer]
GO

CREATE TABLE [dbo].[HostServer] (
	[HostName] varchar(30) NOT NULL PRIMARY KEY,
	[IPAddr] varchar(15) NOT NULL
)
GO
