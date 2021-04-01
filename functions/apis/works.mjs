import bfastnode from "bfastnode";
import numeral from 'numeral';

const { bfast } = bfastnode;

export const addWork = bfast.functions().onPostHttpRequest(
    '/works/:type',
    (request, response) => {
        let workType = request.params.type;
        const work = request.body;
        if (workType.toString().trim() === '1') {
            workType = 'online';
        } else {
            workType = 'physical';
        }
        work.type = workType;
        if (work && work.wage && work.mobile && work.title) {
            bfast.database().table('works').save(work).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                response.status(400).json(reason);
            });
        } else {
            response.status(400).json({ message: "bad data format" });
        }
    }
);

export const getWorksByCategoryV2 = bfast.functions().onGetHttpRequest(
    '/works/:category',
    (request, response) => {
        bfast.database().table('works').query()
            .equalTo("category", request.params.category)
            .orderBy("_created_at", -1)
            .size(size)
            .skip(skip)
            .find().then(value => {
                if (value && Array.isArray(value) && value.length > 0) {
                    response.status(200).json({
                        kazi: value.map(x => {
                            return `${value.indexOf(x) + 1}) ${x.title} Tsh ${numeral(x.wage).format('0,0')} Piga ${x.mobile}.`;
                        }).join('\n'),
                        mbele: {
                            skip: (page + 1) * size,
                            size: size,
                            page: page + 1
                        },
                        nyuma: {
                            skip: page * size,
                            size: size,
                            page: page
                        }
                    });
                } else {
                    response.status(200).json({
                        kazi: 'hamna',
                        mbele: {
                            skip: 0,
                            size: 8,
                            page: 0
                        },
                        nyuma: {
                            skip: 0,
                            size: 8,
                            page: 0
                        }
                    });
                }
            }).catch(reason => {
                console.log(reason);
                response.status(400).json(reason);
            });
    }
);


export const saveWorkV2 = bfast.functions().onPostHttpRequest(
    '/works',
    (request, response) => {
        const body = request.body;
        const work = body.work;
        const user = body.user;
        if (work && user && user.name) {
            if(work.name && work.price && work.region && work.slots && work.days && work.phone && work.location && work.category){
                work.owner = user;
                bfast.database().table('works').save(work).then(value=>{
                    response.status(200).json(value);
                }).catch(reason=>{
                    response.status(400).send(reason);
                });
            }else{
                response.status(400).json({jibu: "work object is invalid"});
            }
        } else {
            response.status(400).json({ jibu: "please enter a valid data type" });
        }
    }
);

export const getWorksToDoV2 = bfast.functions().onGetHttpRequest(
    '/works',
    (request, response)=>{
        const region = request.query.region?request.query.region: '';

    }
)