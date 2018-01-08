drop database if exists trip;
create database trip;
use trip;

drop table if exists Izlet;

drop table if exists Kraj;

drop table if exists Prevozno_sredstvo;

drop table if exists Uporabnik;

drop table if exists Znamenitost;

drop table if exists izleti_uporabnikov;

drop table if exists kraji_izletov;

/*==============================================================*/
/* Table: Izlet                                                 */
/*==============================================================*/
create table Izlet
(
   ID_izlet             int not null,
   ID_prevozno_sredstvo int not null,
   naziv                varchar(80) not null,
   datum                date not null,
   primary key (ID_izlet)
);

/*==============================================================*/
/* Table: Kraj                                                  */
/*==============================================================*/
create table Kraj
(
   ID_kraj              int not null,
   naziv                varchar(80) not null,
   zemljepisna_visina  double not null,
   zemljepisna_sirina  double not null,
   primary key (ID_kraj)
);

/*==============================================================*/
/* Table: Prevozno_sredstvo                                     */
/*==============================================================*/
create table Prevozno_sredstvo
(
   ID_prevozno_sredstvo int not null,
   naziv                varchar(80) not null,
   primary key (ID_prevozno_sredstvo)
);

/*==============================================================*/
/* Table: Uporabnik                                             */
/*==============================================================*/
create table Uporabnik
(
   ID_uporabnik         int not null,
   ime                  varchar(30) not null,
   priimek              varchar(30) not null,
   uporabnisko_ime      varchar(30) not null,
   geslo                varchar(50) not null,
   eposta               char(100) not null,
   telefon              varchar(15),
   primary key (ID_uporabnik)
);

/*==============================================================*/
/* Table: Znamenitost                                           */
/*==============================================================*/
create table Znamenitost
(
   ID_znamenitost       int not null,
   ID_kraj              int not null,
   naziv                varchar(80) not null,
   opis                 varchar(255),
   ocena                float not null,
   zemljepisna_visina  double not null,
   zemljepisna_sirina  double not null,
   slika                varchar(1000),
   thumbnail            varchar(1000),
   primary key (ID_znamenitost)
);

/*==============================================================*/
/* Table: izleti_uporabnikov                                    */
/*==============================================================*/
create table izleti_uporabnikov
(
   ID_uporabnik         int not null,
   ID_izlet             int not null,
   primary key (ID_uporabnik, ID_izlet)
);

/*==============================================================*/
/* Table: kraji_izletov                                         */
/*==============================================================*/
create table kraji_izletov
(
   ID_kraj              int not null,
   ID_izlet             int not null,
   primary key (ID_kraj, ID_izlet)
);

alter table Izlet add constraint FK_prevozno_sredstvo_izleta foreign key (ID_prevozno_sredstvo)
      references Prevozno_sredstvo (ID_prevozno_sredstvo) on delete restrict on update restrict;

alter table Znamenitost add constraint FK_kraj_znamenitosti foreign key (ID_kraj)
      references Kraj (ID_kraj) on delete restrict on update restrict;

alter table izleti_uporabnikov add constraint FK_izleti_uporabnikov foreign key (ID_uporabnik)
      references Uporabnik (ID_uporabnik) on delete restrict on update restrict;

alter table izleti_uporabnikov add constraint FK_izleti_uporabnikov2 foreign key (ID_izlet)
      references Izlet (ID_izlet) on delete restrict on update restrict;

alter table kraji_izletov add constraint FK_kraji_izletov foreign key (ID_kraj)
      references Kraj (ID_kraj) on delete restrict on update restrict;

alter table kraji_izletov add constraint FK_kraji_izletov2 foreign key (ID_izlet)
      references Izlet (ID_izlet) on delete restrict on update restrict;



