
create schema lesson_booking;

create table lesson_booking.corso
(
    title  varchar(255) not null
        primary key,
    `desc` varchar(255) null
);

create table lesson_booking.docente
(
    id_number varchar(255) not null
        primary key,
    name      varchar(255) null,
    surname   varchar(255) null
);

create table lesson_booking.utente
(
    account  varchar(255) not null
        primary key,
    password varchar(255) null,
    role     varchar(255) null
);
INSERT INTO lesson_booking.utente (account, password, role)
VALUES ('ema.morra', '12DE3A4DAB98EF8A7D67AACE8150B540', 'utente');
INSERT INTO lesson_booking.utente (account, password, role)
VALUES ('luca.modica', '6E6BC4E49DD477EBC98EF4046C067B5F', 'amministratore');
INSERT INTO lesson_booking.utente (account, password, role)
VALUES ('salvo.ruvolo', '432545CECBD8AE01E9E60752E40DDADD', 'utente');

create table lesson_booking.affiliazione
(
    teacher_id   varchar(255) not null,
    course_title varchar(255) not null,
    primary key (teacher_id, course_title),
    constraint affiliazione_course___fk
        foreign key (course_title) references corso (title)
            on delete cascade,
    constraint affiliazione_teacher__fk
        foreign key (teacher_id) references docente (id_number)
            on delete cascade
);

create table lesson_booking.ripetizione
(
    teacher varchar(100) not null,
    t_slot  varchar(100) not null,
    day     varchar(100) not null,
    status  varchar(255) not null,
    user    varchar(100) not null,
    course  varchar(255) not null,
    name    varchar(255) null,
    surname varchar(255) null,
    primary key (teacher, t_slot, day, user),
    constraint ripetizione_user___fk
        foreign key (user) references utente (account)
);

