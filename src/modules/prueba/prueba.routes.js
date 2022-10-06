import { Router } from 'express'
import { getPruebas, getPrueba, createPrueba } from './prueba.controller'
const router = Router()

router.get('/', getPruebas)
router.get('/:id', getPrueba)
router.post('/', createPrueba)

export default router