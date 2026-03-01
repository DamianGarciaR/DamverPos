
# Arquitectura de Sistema de Facturación SaaS con Firebase

## Visión General

Este documento describe la arquitectura para un sistema de facturación web SaaS (Software as a Service) multiempresa, multiusuario y multipunto de venta, utilizando los servicios de Firebase. El sistema está diseñado para cumplir con los requisitos de facturación fiscal en Argentina, incluyendo control de stock avanzado, trazabilidad por número de serie, listas de precios y gestión de cuentas corrientes.

## 1. Estructura de Colecciones Firestore

La base de datos en Firestore se organiza en las siguientes colecciones principales:

*   **/companies**: Almacena información sobre cada empresa cliente.
    *   `{companyId}`: Documento único por empresa.
        *   `name`: Nombre de la empresa.
        *   `cuit`: CUIT de la empresa.
        *   `address`: Dirección fiscal.
        *   `subscription`: { `type`: "premium", `status`: "active" }

*   **/users**: Contiene los perfiles de todos los usuarios del sistema.
    *   `{userId}`: Documento único por usuario (corresponde al UID de Firebase Auth).
        *   `email`: Email del usuario.
        *   `companyId`: ID de la empresa a la que pertenece.
        *   `role`: Rol del usuario ("admin", "supervisor", "vendedor").
        *   `pointOfSaleId`: ID del punto de venta asignado.

*   **/products**: Catálogo de productos de cada empresa.
    *   `{productId}`: Documento único por producto.
        *   `companyId`: ID de la empresa propietaria del producto.
        *   `name`: Nombre del producto.
        *   `sku`: Código de producto.
        *   `description`: Descripción.
        *   `price`: Precio base.
        *   `tax`: Impuestos aplicables.

*   **/stock**: Control de inventario por producto y punto de venta.
    *   `{stockId}`: Documento único.
        *   `productId`: ID del producto.
        *   `pointOfSaleId`: ID del punto de venta.
        *   `quantity`: Cantidad disponible.

*   **/serialNumbers**: Trazabilidad de productos por número de serie.
    *   `{serialNumberId}`: Documento único.
        *   `productId`: ID del producto asociado.
        *   `serialNumber`: Número de serie.
        *   `status`: "disponible", "vendido", "en_reparacion".
        *   `saleId`: (Opcional) ID de la venta si fue vendido.

*   **/priceLists**: Listas de precios personalizadas.
    *   `{priceListId}`: Documento único.
        *   `companyId`: ID de la empresa.
        *   `name`: Nombre de la lista (ej. "Mayorista", "Retail").
        *   `products`: [ { `productId`: "...", `price`: "..." } ]

*   **/sales**: Registro de todas las transacciones de venta.
    *   `{saleId}`: Documento único por venta.
        *   `companyId`: ID de la empresa.
        *   `pointOfSaleId`: ID del punto de venta.
        *   `userId`: ID del vendedor.
        *   `clientId`: ID del cliente.
        *   `items`: [ { `productId`: "...", `quantity`: "...", `price`: "..." } ]
        *   `total`: Monto total.
        *   `date`: Fecha y hora.

*   **/clients**: Información de los clientes de cada empresa.
    *   `{clientId}`: Documento único por cliente.
        *   `companyId`: ID de la empresa.
        *   `name`: Nombre del cliente.
        *   `cuit`: CUIT del cliente.

*   **/currentAccounts**: Gestión de saldos de clientes.
    *   `{accountId}`: Documento único.
        *   `clientId`: ID del cliente.
        *   `balance`: Saldo actual.
        *   `history`: [ { `date`: "...", `type`: "venta/pago", `amount`: "..." } ]

## 2. Relaciones entre Documentos

Las relaciones se gestionan mediante la referencia de IDs de documentos:

*   Un **usuario** (`/users/{userId}`) pertenece a una única **empresa** (`/companies/{companyId}`).
*   Un **producto** (`/products/{productId}`) es propiedad de una **empresa**.
*   El **stock** (`/stock/{stockId}`) asocia un **producto** a un **punto de venta**.
*   Los **números de serie** (`/serialNumbers/{serialNumberId}`) están ligados a un **producto**.
*   Las **ventas** (`/sales/{saleId}`) registran qué **productos** fueron vendidos por un **usuario** a un **cliente**.

## 3. Reglas de Seguridad

Las reglas de seguridad de Firestore son cruciales para proteger los datos de cada empresa.

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isUserInCompany(companyId) {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == companyId;
    }

    function isAdmin(companyId) {
      return isUserInCompany(companyId) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isSupervisor(companyId) {
      let userRole = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
      return isUserInCompany(companyId) && (userRole == 'supervisor' || userRole == 'admin');
    }

    // Las empresas solo pueden ser leídas por sus propios usuarios
    match /companies/{companyId} {
      allow read: if isUserInCompany(companyId);
      allow write: if false; // La creación/modificación se maneja desde una función de admin
    }

    // Los usuarios solo pueden ser gestionados por un admin de su misma empresa
    match /users/{userId} {
      allow read: if isUserInCompany(get(/databases/$(database)/documents/users/$(userId)).data.companyId);
      allow create, update: if isAdmin(get(/databases/$(database)/documents/users/$(userId)).data.companyId);
    }

    // CRUD de productos solo para admins y supervisores
    match /products/{productId} {
      allow read: if isUserInCompany(resource.data.companyId);
      allow create, update, delete: if isSupervisor(resource.data.companyId);
    }

    // El stock solo puede ser leído por usuarios de la empresa y modificado por supervisores
    match /stock/{stockId} {
        allow read: if isUserInCompany(get(/databases/$(database)/documents/products/$(resource.data.productId)).data.companyId);
        allow write: if isSupervisor(get(/databases/$(database)/documents/products/$(resource.data.productId)).data.companyId);
    }

    // Las ventas pueden ser creadas por vendedores, pero solo leídas/gestionadas por supervisores
    match /sales/{saleId} {
        allow read: if isSupervisor(resource.data.companyId);
        allow create: if isUserInCompany(resource.data.companyId); // Vendedores pueden crear
    }
  }
}
```

## 4. Modelo de Permisos por Rol

*   **Admin**:
    *   Gestión completa de usuarios (crear, editar, eliminar).
    *   Gestión de puntos de venta.
    *   Configuración de la empresa.
    *   Acceso a todos los informes.
    *   Hereda todos los permisos de Supervisor.

*   **Supervisor**:
    *   Gestión de productos (CRUD).
    *   Gestión de stock.
    *   Gestión de listas de precios.
    *   Visualización de todas las ventas y cuentas corrientes.
    *   Anulación de facturas.

*   **Vendedor**:
    *   Creación de ventas (facturas, notas de crédito/débito).
    *   Consulta de stock y precios.
    *   Gestión de su propia cuenta corriente de clientes.

## 5. Diagrama Explicativo en Texto

```
[Firebase Auth]
      |
      --> uid --> [Firestore /users/{userId}] (Rol, CompanyID)
                        |
                        | (Pertenece a)
                        |
      [Firestore /companies/{companyId}]
      /      |      \
     /       |       \
(Tiene) (Tiene) (Tiene)
   |         |         |
[P.V. 1] [P.V. 2] [P.V. 3]
   |         |
(Gestiona Stock de) (Gestiona Ventas de)
   |         |
[Firestore /products] ---> [Firestore /stock]
   |
(Se vende en)
   |
[Firestore /sales] ---> (Actualiza) ---> [Firestore /currentAccounts]
   |
(Registra uso de)
   |
[Firestore /serialNumbers]

```
