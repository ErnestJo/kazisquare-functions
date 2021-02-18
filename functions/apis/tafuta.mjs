import bfastnode from "bfastnode";
const {bfast} = bfastnode;

export const searchWikipedia = bfast.functions().onHttpRequest(
    '/learn',
    (request, respose)=>{
        let query = request.query.q;
        const body = request.body;
        if(body && body.q){
             query = body.q;
        }
        const searchUrl = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(query)}`
        bfast.functions().request(searchUrl).get().then(value=>{
           if(value && value.query && value.query.pages && typeof value.query.pages === 'object'){
               const _jibu = Object.keys(value.query.pages).map(x=> value.query.pages[x]? value.query.pages[x].extract: 'Hamna jibu kwa sasa jaribu kitu kingine').join(' ').trim();
               respose.status(200).json({
                   jibu: _jibu !== ''?_jibu: 'Hamna jibu kwa sasa jaribu kitu kingine'
               });
           }else{
            respose.status(200).json({
                jibu: "Hamna jibu kwa sasa jaribu kitu kingine"
            });
           }
        }).catch(reason=>{
            console.log(reason);
            respose.status(400).send(value);
        })
    }
);