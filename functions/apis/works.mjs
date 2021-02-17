import bfastnode from "bfastnode";

const { bfast } = bfastnode;

export const addWork = bfast.functions().onPostHttpRequest(
    '/works/:type',
    (request, response)=>{
        let workType = request.params.type;
        const work = request.query?request.query: {};
        if(workType.toString().trim() === '1'){
            workType = 'online';
        }else{
            workType = 'physical'
        }
        work.type = workType;
        response.json(work);
    }
);