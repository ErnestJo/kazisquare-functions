import bfastnode from "bfastnode";
import moment from "moment";

const {bfast} = bfastnode;

let isRunning = false;

export const removeJob2 = bfast.functions().onJob({
    second: '0',
    minute: '0'
}, _ => {
    if (isRunning === false) {
        isRunning = true;
        bfast.database().table('works')
            .query()
            .greaterThanOrEqual('removeAt', moment().toISOString())
            .equalTo('removed', false)
            .size(100000000)
            .updateBuilder()
            .set('removed', true)
            .update()
            // .then(console.log)
            .catch(console.log)
            .finally(() => {
                isRunning = false;
            });
    }
});
