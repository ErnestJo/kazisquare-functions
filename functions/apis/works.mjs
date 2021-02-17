import bfastnode from "bfastnode";
import numeral from 'numeral';

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
        if(work && work.wage && work.mobile && work.title ){
            bfast.database().table('works').save(work).then(value=>{
                response.status(200).json(value);
            }).catch(reason=>{
                response.status(400).json(reason);
            });
        }else{
            response.status(400).json({message: "bad data format"});
        }
    }
);

export const getWorks = bfast.functions().onGetHttpRequest(
    '/works/:type',
    (request, response)=>{
        let workType = request.params.type;
        let skip = request.query.skip?request.query.skip: 0;
        let size = request.query.size?request.query.size: 8;
        if(Number.isNaN(skip)){
            skip = parseInt(skip);
        }
        if(Number.isNaN(size)){
            size = parseInt(size);
        }
        if(workType.toString().trim() === '1'){
            workType = 'online';
        }else{
            workType = 'physical';
        }
        bfast.database().table('works').query()
        .equalTo("type", workType)
        .orderBy("_created_at", -1)
        .size(8)
        .find().then(value=>{
            if(value && Array.isArray(value) && value.length>0){
                response.status(200).json({
                    kazi: value.map(x=>{
                        return `${value.indexOf(x)+1}) ${x.title} Tsh ${numeral(x.wage).format('0,0')} Piga ${x.mobile}.`;
                    }).join('\n'),
                    skip: skip,
                    size: size
                });
            }else{
                response.status(200).json({
                    kazi: `Hamna kazi kwa sasa, tutakujulisha zitakapotokea`,
                    skip: skip,
                    size: size
                });
            }
        }).catch(reason=>{
            console.log(reason);
            response.status(400).json(reason);
        });
    }
);