const express = require( 'express' );
const router = express.Router();
const fs = require( 'fs' );

//inicializar express
const app = express();

//Settings
const PORT = process.env.PORT || 8080;
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

//view engine:
app.set( 'view engine', 'ejs' );
app.set( 'views', __dirname + '/views' );

//Routes
//0) espacio publico con el formulario HTML
app.get( '/', ( req, res ) => {
    res.render( 'index', { mesage: '' } )
});

//1) Devuelve todos los productos
router.get( '/', ( req, res ) => {
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    res.render( 'productos', { products: products } );
});

//2) Devuelve un producto segun su id
router.get( '/:id', ( req, res ) => {
    const id = Number( req.params.id );
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const product = products.find( prod => prod.id === id );
    if ( product == undefined ){
        res.send({ error: 'Producto no encontrado' });
    } else {
        res.json( product );
    }
});

//3) Recibe y agrega un producto. Devuelve el producto agregado y su ID asignada:
router.post( '/', ( req, res ) => {
    const product = req.body;
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const productsId = products.map( p => p.id );
    product.id = Math.max( ...productsId ) + 1;

    products.push( product );

    fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );
    res.render( 'index', { mesage: 'Producto agregado' } );
});

//4) Edita un producto segun su id:
router.put( '/:id', ( req, res ) => {
    const id = req.params.id;
    const product = req.body;
    product.id = id;
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const idx = products.findIndex( p => p.id == id );

    if( idx === -1 ){
        res.send( 'El producto que desea editar no existe.' )
    } else {
        products.splice( idx, 1, product );

        fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );
        res.json( product );
    }
});

//5) Elimina un producto segun su id:
router.delete( '/:id', ( req, res ) => {
    const id = req.params.id;
    const read = fs.readFileSync( './productos.txt', 'utf-8' );
    const products = JSON.parse( read );

    const idx = products.findIndex( p => p.id == id );

    if( idx === -1 ){
        res.send( 'El producto que desea eliminar no existe.' )
    } else {
        products.splice( idx, 1 );

        fs.writeFileSync( './productos.txt', JSON.stringify( products, null, '\t' ) );
        res.json( `Se elimino el producto con id: ${ id }` );
    }
});

//Router
app.use( '/api/productos', router );

//Server listening
const server = app.listen( PORT, () => {
    console.log( `Server on PORT: ${ PORT }` );
});
server.on( 'error', err => console.log( 'Error en el server: ' + err ) );