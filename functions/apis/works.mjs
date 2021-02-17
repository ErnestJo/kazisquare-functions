import bfastnode from "bfastnode";

const { bfast } = bfastnode;

export const addWork = bfast.functions().onPostHttpRequest(
    '/works/:type',
    (request, response) => {
        let workType = request.params.type;
        const work = request.body;
        if(workType.toString().trim() === '1'){
            workType = 'online';
        }else{
            workType = 'physical';
        }
        work.type = workType;
        bfast.database().table('works').save(work).then(value=>{
            response.status(200).json(value);
        }).catch(reason=>{
            response.status(400).json(reason);
        });
    }
);

export const getWorks = bfast.functions().onGetHttpRequest(
    '/works/:type',
    (request, response)=>{
        let workType = request.params.type;
        if(workType.toString().trim() === '1'){
            workType = 'online';
        }else{
            workType = 'physical';
        }
        bfast.database().table('works').query()
        .equalTo("type", workType)
        .orderBy("_created_at", -1)
        .find().then(value=>{
            response.status(200).json(value);
        }).catch(reason=>{
            response.status(400).json(reason);
        });
    }
);