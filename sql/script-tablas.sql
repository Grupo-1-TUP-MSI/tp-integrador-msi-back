
CREATE TABLE Roles(
ID serial primary key not null,
Rol varchar(50)
);


CREATE TABLE Usuarios(
ID SERIAL primary key not NULL,
Usuario varchar(50),
Contraseña varchar(50),
IdRol int references Roles(ID),
Estado bool
);

CREATE TABLE Categorias(
ID serial primary key not null,
Nombre varchar(255)
);

CREATE TABLE Productos(
ID serial primary key not null,
Nombre VARCHAR(255),
Precio DECIMAL(13,2),
Stock  INT,
StockMinimo int,
IdCategoria int references Categorias(ID),
Estado bool
)

CREATE TABLE TipoDocumentos(
ID serial primary key not null,
Tipo VARCHAR(20)
)

CREATE TABLE Clientes(
ID serial primary key not null,
Nombre varchar(100),
TipoIVA char(1),
IdTipoDocumento int REFERENCES TipoDocumentos(ID),
Documento int,
Calle varchar(50),
Numero int,
Departamento varchar(10),
Barrio varchar(30),
CP varchar(20),
Telefono varchar(30),
Email varchar(30),
Estado bool

)

CREATE TABLE Proveedores(
ID serial primary key not null,
Nombre varchar(100),
TipoIVA char(1),
IdTipoDocumento int REFERENCES TipoDocumentos(ID),
Documento int,
Calle varchar(50),
Numero int,
Departamento varchar(10),
Barrio varchar(30),
CP varchar(20),
Telefono varchar(30),
Email varchar(30),
Estado bool

)

CREATE TABLE PuntoVentas(
ID serial primary key not null,
Punto varchar(50)
)

CREATE TABLE Facturas(
ID serial primary key not null,
Fecha timestamp,
IdPuntoVenta int REFERENCES PuntoVentas(ID),
Numero int,
FechaVencimiento timestamp,
IdUsuario int REFERENCES Usuarios(ID),
IdCliente int REFERENCES Clientes(ID)

)

CREATE TABLE DetalleFactura(
ID serial primary key not null,
IdProducto int REFERENCES Productos(ID),
IdFactura int REFERENCES Facturas(ID),
Cantidad int,
Precio decimal(13,2),
Descuento int
)

CREATE TABLE NotasDePedido(
ID serial primary key not null,
Fecha timestamp,
Numero int,
Vencimiento timestamp,
IdUsuario int REFERENCES Usuarios(ID),
IdProveedor int REFERENCES Proveedores(ID)
)

CREATE TABLE DetalleNP(
ID serial primary key not null,
IdProducto int REFERENCES Productos(ID),
IdNP int REFERENCES NotasDePedido(ID),
CantidadPedida int,
CantidadRecibida int,
Precio decimal(13,2),
Descuento int,
Estado bool
)




