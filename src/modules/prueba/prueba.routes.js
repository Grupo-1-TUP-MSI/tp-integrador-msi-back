import { Router } from 'express'
import { getPruebas, getPrueba, createPrueba, updatePrueba, deletePrueba } from './prueba.controller'
const router = Router()

router.get('/', getPruebas)
router.get('/:id', getPrueba)
router.post('/', createPrueba)
router.put('/:id', updatePrueba)
router.delete('/:id', deletePrueba)

export default router