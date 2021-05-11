import bfastnode from "bfastnode";
import numeral from 'numeral';
import {WorksController} from "../constrollers/works.controller.mjs";

const worksController = new WorksController();
const {bfast} = bfastnode;
const userWorkChoices = {};

export const getWorksByCategoryV2 = bfast.functions().onGetHttpRequest(
    '/works/:category/:uuid',
    (request, response) => {
        const uuid = request.params.uuid;
        let skip = request.query.skip ? request.query.skip : 0;
        let size = request.query.size ? request.query.size : 8;
        let page = request.query.page ? request.query.page : 0;
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
                userWorkChoices[uuid] = {createdAt: new Date()};
                response.status(200).json({
                    kazi: value.map(x => {
                        userWorkChoices[uuid][value.indexOf(x) + 1] = x.id;
                        return `${value.indexOf(x) + 1}) ${x.name} Tsh ${numeral(x.price).format('0,0')} Maelezo ${x.location}.`;
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
                .update({returnFields: []})
                .then(value12 => {
                    try {
                        const contacts = [];
                        const uuid = value12.owner.uuid;
                        const workName = value12.name;
                        contacts.push(uuid);
                        // console.log(user, '******************* USER');
                        bfast.functions()
                            .request('https://rapidpro.ilhasoft.mobi/api/v2/broadcasts.json')
                            .post({
                                "contacts": contacts,
                                "text": [
                                    `Kazi yako ${workName} imechaguliwa na ${user.name} mwenye namba . `,
                                ].join('')
                            }, {
                                headers: {
                                    Authorization: 'Token a47c6a3aa306cd979ee4bf07d65766eaabad2199',
                                    'content-type': 'application/json'
                                }
                            })
                            .then(value234 => {
                                console.log(value234, ': sms imetumwa kwa mwenye kazi.')
                            })
                            .catch(_234 => {
                                console.log(_234, ': imeshindwa tuma sms kwa mwenye kazi.');
                            });
                    } catch (e) {
                        console.log(e, "*************** SEND SMS");
                    }
                    response.status(200).json(value12);
                })
                .catch(reason => {
                    response.status(400).send(reason);
                });
        } else {
            response.status(400).send({message: "no choices for you"});
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
                response.status(400).json({jibu: "work object is invalid"});
            }
        } else {
            response.status(400).json({jibu: "please enter a valid data type"});
        }
    }
);
