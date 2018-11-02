import {Micox, Portal, html} from "micox"
import {IDestructedURL} from "micox/dist/router"
import {router} from "../"
const db = 'markit'
const req = indexedDB.open(db)
req.onsuccess = (event) => {
    const target: any = event.target!
    const db = target.result
    db.close()
}

export const defaultPage = (props: IDestructedURL) => (portal: Portal) => {
    return html.div([
        html.h1("Memo"),
        html.button("create").events({
            click: ev => router.redirect("/note/create")
        }),
    ])
}