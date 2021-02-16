import bfastnode from 'bfastnode';

const {bfast} = bfastnode;

bfast.init({
    applicationId: 'kazisquare',
    projectId: 'kazisquare',
    appPassword: 'kazisquare2021'
})

export const home = bfast.functions().onHttpRequest('/', (request, response) => {
    response.json({message: 'KaziSquare public API'});
});