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


IF OBJECT_ID('[dbo].[ServerProcess]') IS NOT NULL
	DROP TABLE [dbo].[ServerProcess]
GO

CREATE TABLE [dbo].[ServerProcess] (
	[HostName] varchar(30) NOT NULL,
	[ServerName] varchar(255) NOT NULL,
	[ProcessPath] varchar(255) NOT NULL,

	PRIMARY KEY([HostName], [ServerName])
)
GO
