

CREATE TABLE Roles (
	ID serial PRIMARY KEY NOT NULL
	,Rol VARCHAR(50)
	);


CREATE TABLE Usuarios (
	ID SERIAL PRIMARY KEY NOT NULL
	,Usuario VARCHAR(50)
	,Password VARCHAR(50)
	,NombreCompleto VARCHAR(100)	
	,IdRol INT REFERENCES Roles(ID)
	,Estado bool
	);

CREATE TABLE TipoDocumentos (
	ID serial PRIMARY KEY NOT NULL
	,Tipo VARCHAR(20)
	);

CREATE TABLE TiposIVA (
	ID serial PRIMARY KEY NOT NULL
	,Tipo bpchar(1)
	,Descripcion VARCHAR(50)
	)

CREATE TABLE Clientes (
	ID serial PRIMARY KEY NOT NULL
	,Nombre VARCHAR(100)
	,TipoIVA INT REFERENCES TiposIVA(id)
	,IdTipoDocumento INT REFERENCES TipoDocumentos(ID)
	,Documento VARCHAR(20)
	,Direccion VARCHAR(255)
	,CP VARCHAR(20)
	,Telefono VARCHAR(30)
	,Email VARCHAR(255)
	,Estado bool
	);

CREATE TABLE Proveedores (
	ID serial PRIMARY KEY NOT NULL
	,Nombre VARCHAR(100)
	,TipoIVA INT REFERENCES TiposIVA(id)
	,IdTipoDocumento INT REFERENCES TipoDocumentos(ID)
	,Documento VARCHAR(20)
	,Direccion VARCHAR(255)
	,CP VARCHAR(20)
	,Telefono VARCHAR(30)
	,Email VARCHAR(255)
	,Estado bool
	);

CREATE TABLE Productos (
	ID serial PRIMARY KEY NOT NULL
	,Nombre VARCHAR(255)
	,Descripcion VARCHAR(255)
	,PrecioLista DECIMAL(13, 2)
	,Stock INT default 0
	,StockMinimo INT	
	);

CREATE TABLE ProductosXProveedores (
	ID serial PRIMARY KEY NOT NULL
	,IdProveedor INT references Proveedores(ID)
	,IdProducto  INT references Productos(ID)	
	,Precio DECIMAL(13, 2)
	,Estado bool	
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
	,Numero SERIAL
	,FechaVencimiento TIMESTAMP
	,IdUsuario INT REFERENCES Usuarios(ID)
	,IdCliente INT REFERENCES Clientes(ID)
	,Estado bool
	,Pagada bool
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
	,Version INT
	,Vencimiento TIMESTAMP
	,IdUsuario INT REFERENCES Usuarios(ID)
	,IdProveedor INT REFERENCES Proveedores(ID)
	,IdEstadoNP INT REFERENCES EstadoNP(ID)
	,IdTipoCompra INT REFERENCES TiposCompra(ID)
	);

CREATE TABLE DetalleNP (
	ID serial PRIMARY KEY NOT NULL
	,IdProductoProveedor INT REFERENCES ProductosXProveedores(ID)
	,IdNP INT REFERENCES NotasDePedido(ID)
	,CantidadPedida INT
	,CantidadRecibida INT
	,Precio DECIMAL(13, 2)
	,Descuento INT
	,Estado bool
	);

	CREATE TABLE ganancias (
	ID serial PRIMARY KEY NOT NULL
	,vigencia TIMESTAMP
	,porcentaje DECIMAL(5, 2)
	,idusuario INT REFERENCES usuarios(ID)
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
	,NombreCompleto
	,IdRol
	,Estado
	)
VALUES (
	'admin@colorcol.com.ar'
	,'admin'
	,'Juan Panadero'
	,1
	,true
	)
	,(
	'compras@colorcol.com.ar'
	,'compras'
	,'Fabiana Cantilo'
	,2
	,true
	)
	,(
	'ventas@colorcol.com.ar'
	,'ventas'
	,'Stephen Curry'
	,3
	,true
	);



INSERT INTO TiposIVA (
	tipo
	,descripcion
	)
VALUES (
	'I'
	,'Responsable Inscripto'
	)
	,(
	'M'
	,'Monotributista'
	)
	,(
	'C'
	,'Consumidor Final'
	);

INSERT INTO clientes (
	nombre
	,tipoiva
	,idtipodocumento
	,documento
	,direccion
	,cp
	,telefono
	,email
	,estado
	)
VALUES (
	'Joaquin Gimenez'
	,2
	,1
	,33501176
	,'Zapiola 77'
	,'5000'
	,'3585622138'
	,'joaquin@gmail.com'
	,true
	)
	,(
	'Carlos Menem'
	,1
	,3
	,12222333
	,'Salto 30'
	,'5800'
	,'358111222'
	,'elcarlo@gmail.com'
	,true
	)
	,(
	'Lionel Messi'
	,1
	,2
	,31555772
	,'Marcelo T De Alvear 1523'
	,'5000'
	,'3512225588'
	,'messi@gmail.com'
	,true
	)



