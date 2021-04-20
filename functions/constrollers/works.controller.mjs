import h2j from 'html2json';
import bfastnode from 'bfastnode';

const {bfast} = bfastnode;
const {html2json} = h2j;

export class WorksController{
    async kaziRasmi(){
        console.log(html2json);
        return bfast.functions().request('http://www.vijanatz.com/tz/jobs/')
        .get()
        .then(doc=>{
            const matchs = doc.toString().match(new RegExp('(<ol.*class\=\"jobs\">)(.*?|\n)*?(<\/ol>)', 'ig'));
            return html2json(matchs && matchs[0]?matchs[0]:'');
        });
    }
}
