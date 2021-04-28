import bfastnode from "bfastnode";
import numeral from 'numeral';
import { WorksController } from "../constrollers/works.controller.mjs";

const worksController = new WorksController();
const { bfast } = bfastnode;
const userWorkChoices = {};

// export const addWork = bfast.functions().onPostHttpRequest(
//     '/works/:type',
//     (request, response) => {
//         let workType = request.params.type;
//         const work = request.body;
//         if (workType.toString().trim() === '1') {
//             workType = 'online';
//         } else {
//             workType = 'physical';
//         }
//         work.type = workType;
//         if (work && work.wage && work.mobile && work.title) {
//             bfast.database().table('works').save(work).then(value => {
//                 response.status(200).json(value);
//             }).catch(reason => {
//                 response.status(400).json(reason);
//             });
//         } else {
//             response.status(400).json({ message: "bad data format" });
//         }
//     }
// );

export const getWorksByCategoryV2 = bfast.functions().onGetHttpRequest(
    '/works/:category/:uuid',
    (request, response) => {
        const uuid = request.params.uuid;
        let skip = request.query.skip ? request.query.skip : 0;
        let size = request.query.size ? request.query.size : 8;
        let page = request.query.page ? request.query.page : 0;
        const category = request.params.category;
        // if(category === 'rasmi'){
        //     worksController.kaziRasmi().then(kazir=>{
        //         response.json(kazir);
        //     }).catch(reason=>{
        //         console.log(reason);
        //         response.status(400).send(reason);
        //     });
        // }else{
        page = parseInt(page);
        skip = parseInt(skip);
        size = parseInt(size);
        bfast.database().table('works').query()
            .equalTo("category", request.params.category)
            .orderBy("_created_at", -1)
            .equalTo('removed', false)
            .equalTo('selected', false)
            .size(size)
            .skip(skip)
            .find().then(value => {
                if (value && Array.isArray(value) && value.length > 0) {
                    userWorkChoices[uuid] = { createdAt: new Date() };
                    response.status(200).json({
                        kazi: value.map(x => {
                            userWorkChoices[uuid][value.indexOf(x) + 1] = x.id;
                            return `${value.indexOf(x) + 1}) ${x.name} Tsh ${numeral(x.price).format('0,0')} Piga ${x.phone}.`;
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
    // }
);

export const selectWorkToDo = bfast.functions().onPostHttpRequest(
    '/select/:uuid/works/:workid',
    (request, response) => {
        const uuid = request.params.uuid;
        const workId = request.params.workid;
        const user = request.body.user;
        if (userWorkChoices[uuid]
            && typeof userWorkChoices[uuid] === "object"
            && userWorkChoices[uuid][workId]
            && typeof userWorkChoices[uuid][workId] === "string"
        ) {
            bfast.database().table('works')
                .query()
                .byId(userWorkChoices[uuid][workId])
                .updateBuilder()
                .set('removed', false)
                .set('selected', false)
                .set('selected_by', user)
                .update()
                // .get(userWorkChoices[uuid][workId])
                .then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).send(reason);
                })
        } else {
            response.status(400).send({ message: "no choices for you" });
        }
    }
);

export const saveWorkV2 = bfast.functions().onPostHttpRequest(
    '/works',
    (request, response) => {
        const body = request.body;
        const work = body.work;
        const user = body.user;
        if (work && user && user.name) {
            if (work.name && work.price && work.region && work.slots && work.days && work.phone && work.location && work.category) {
                work.owner = user;
                work.removed = false;
                work.selected = false;
                bfast.database().table('works').save(work).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).json({ jibu: "work object is invalid" });
            }
        } else {
            response.status(400).json({ jibu: "please enter a valid data type" });
        }
    }
);
