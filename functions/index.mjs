import bfastnode from 'bfastnode';

const {bfast} = bfastnode;

export const home = bfast.functions().onHttpRequest('/', (request, response) => {
    response.json({message: 'KaziSquare public API'});
});