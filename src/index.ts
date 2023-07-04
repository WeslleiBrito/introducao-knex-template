import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/bands", async (req: Request, res: Response) => {
    try{
        const result = await db.raw("SELECT * FROM bands;")

        res.status(200).json(result)

    }catch (error: any){
        res.status(500)
        res.send(error.message)
    }
    
})

app.post('/bands', async (req: Request, res: Response) => {
    try {
        const {id, name} = req.body

        Object.entries({id, name}).map((item: Array<string>) => {
            const [key, value] = item

            if(typeof(value) !== "string"){
                res.status(400)
                throw new Error(`Era esperadado um valor do tipo 'string' para a propriedade '${key}', porém o valor recebido foi ${typeof(value)}.`)
            }

            if(value.length === 0){
                res.status(400)
                throw new Error(`A propriedade '${key}' não pode ser vazio.`)
            }
        })
        
        await db.raw(`INSERT INTO bands (id, name) VALUES ("${id}", "${name}")`)

        res.status(200).send(`A banda '${name}' foi inserida com sucesso!`)
    } catch (error: any) {
        console.log(error.message)
        res.send(error.message)
    }
    
})

app.put('/bands/:id', async(req: Request, res: Response) => {
    try {
        
        const id= req.params.id

        const { newId, newName } = req.body

        Object.entries({id, newId, newName}).map((item: Array<string>) => {
            const [key, value] = item

            if(typeof(value) !== "undefined"){

                if(typeof(value) !== "string" ){
                    res.status(400)
                    throw new Error(`Era esperado um valor do tipo string para a propriedade '${key}.'`)
                }

                if(value.length === 0){
                    res.status(400)
                    throw new Error(`A propriedade '${key}, não pode ser vazia.`)
                }
            }
        })

        if(id.length === 0){
            res.status(400)
            throw new Error(`Informe o Id da banda a ser atualizada.`)
        }

        const [band] = await db.raw(`SELECT * FROM bands WHERE id = "${id}"`)
     
        if(band){

            await db.raw(`UPDATE bands SET id = "${newId || band.id}", name = "${newName || band.name}" WHERE id = "${id}"`)
            
        }else{
            res.status(400)
            throw new Error(`Informe um id válido para ser feito a atualização.`)
        }

        res.status(200).send("Banda atualizada com sucesso!")
    } catch (error: any) {
        
        res.send(error.message)
    }
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
