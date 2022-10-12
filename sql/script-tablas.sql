

CREATE TABLE Roles (
	ID serial PRIMARY KEY NOT NULL
	,Rol VARCHAR(50)
	);


CREATE TABLE Usuarios (
	ID SERIAL PRIMARY KEY NOT NULL
	,Usuario VARCHAR(50)
	,Contraseña VARCHAR(50)
	,IdRol INT REFERENCES Roles(ID)
	,Estado bool
	);

CREATE TABLE TipoDocumentos (
	ID serial PRIMARY KEY NOT NULL
	,Tipo VARCHAR(20)
	);

CREATE TABLE Clientes (
	ID serial PRIMARY KEY NOT NULL
	,Nombre VARCHAR(100)
	,TipoIVA CHAR(1)
	,IdTipoDocumento INT REFERENCES TipoDocumentos(ID)
	,Documento INT
	,Direccion VARCHAR(255)
	,CP VARCHAR(20)
	,Telefono VARCHAR(30)
	,Email VARCHAR(30)
	,Estado bool
	);

CREATE TABLE Proveedores (
	ID serial PRIMARY KEY NOT NULL
	,Nombre VARCHAR(100)
	,TipoIVA CHAR(1)
	,IdTipoDocumento INT REFERENCES TipoDocumentos(ID)
	,Documento INT
	,Direccion VARCHAR(255)
	,CP VARCHAR(20)
	,Telefono VARCHAR(30)
	,Email VARCHAR(30)
	,Estado bool
	);

CREATE TABLE Productos (
	ID serial PRIMARY KEY NOT NULL
	,Nombre VARCHAR(255)
	,Precio DECIMAL(13, 2)
	,Stock INT
	,StockMinimo INT
	,idProveedor INT REFERENCES Proveedores(ID)
	,Estado bool
	)

CREATE TABLE PuntoVentas (
	ID serial PRIMARY KEY NOT NULL
	,Punto VARCHAR(50)
	);

CREATE TABLE TiposVenta (
	ID serial PRIMARY KEY NOT NULL
	,Tipo VARCHAR(50)
	);

CREATE TABLE TiposPago (
	ID serial PRIMARY KEY NOT NULL
	,Tipo VARCHAR(50)
	);

CREATE TABLE Facturas (
	ID serial PRIMARY KEY NOT NULL
	,Fecha TIMESTAMP
	,IdTipoVenta INT REFERENCES TiposVenta(ID)
	,IdTipoPago INT REFERENCES TiposPago(ID)
	,Numero INT
	,FechaVencimiento TIMESTAMP
	,IdUsuario INT REFERENCES Usuarios(ID)
	,IdCliente INT REFERENCES Clientes(ID)
	,Estado bool
	);

CREATE TABLE DetalleFactura (
	ID serial PRIMARY KEY NOT NULL
	,IdProducto INT REFERENCES Productos(ID)
	,IdFactura INT REFERENCES Facturas(ID)
	,Cantidad INT
	,Precio DECIMAL(13, 2)
	,Descuento INT
	);

CREATE TABLE EstadoNP (
	ID serial PRIMARY KEY NOT NULL
	,Tipo VARCHAR(50)
	);

CREATE TABLE TiposCompra (
	ID serial PRIMARY KEY NOT NULL
	,Tipo VARCHAR(50)
	);

CREATE TABLE NotasDePedido (
	ID serial PRIMARY KEY NOT NULL
	,Fecha TIMESTAMP
	,Numero INT
	,Vencimiento TIMESTAMP
	,IdUsuario INT REFERENCES Usuarios(ID)
	,IdProveedor INT REFERENCES Proveedores(ID)
	,IdEstadoNP INT REFERENCES EstadoNP(ID)
	,IdTipoCompra INT REFERENCES TiposCompra(ID)
	);

CREATE TABLE DetalleNP (
	ID serial PRIMARY KEY NOT NULL
	,IdProducto INT REFERENCES Productos(ID)
	,IdNP INT REFERENCES NotasDePedido(ID)
	,CantidadPedida INT
	,CantidadRecibida INT
	,Precio DECIMAL(13, 2)
	,Descuento INT
	,Estado bool
	);

INSERT INTO TiposPago (Tipo)
VALUES ('EFECTIVO')
	,('MERCADOPAGO');

INSERT INTO TiposVenta (Tipo)
VALUES ('SALON')
	,('ONLINE');

INSERT INTO TiposCompra (Tipo)
VALUES ('LOCAL')
	,('EXTERIOR');

INSERT INTO TipoDocumentos (Tipo)
VALUES ('DNI')
	,('CUIT')
	,('CUIL')
	,('PASAPORTE');

INSERT INTO Roles (Rol)
VALUES ('ADMINISTRADOR')
	,('COMPRADOR')
	,('VENDEDOR');

INSERT INTO EstadoNP (Tipo)
VALUES ('PEND_ACEPTACION')
	,('PEND_ENTREGA')
	,('CERRADA')
	,('RECHAZADA');

INSERT INTO Usuarios (
	Usuario
	,Password
	,IdRol
	,Estado
	)
VALUES (
	'admin@colorcol.com.ar'
	,'admin'
	,1
	,true
	)
	,(
	'compras@colorcol.com.ar'
	,'compras'
	,2
	,true
	)
	,(
	'ventas@colorcol.com.ar'
	,'ventas'
	,3
	,true
	);

