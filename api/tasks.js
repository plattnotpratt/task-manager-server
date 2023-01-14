const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const utils = require('./utils');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const userId = req.user.id;
  const result = await prisma.task.findMany({
    where:{
      board:{
        userId: userId,
      },
    },
  });
  if(result){
    res.json(result);
  }
});

router.post('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id);
  const payload = {
    title: req.body.title,
    description: req.body.description,
    boardId: id,
  };
  const createdTask = await prisma.task.create({
    data:payload,
  });
  res.json(
    createdTask);
});

router.put('/:id', async (req, res, next) => {
  const payload = {
    title: req.body.title,
    description: req.body.description,
  }
  if(await utils.isTaskOwnedByUser(req.params.id, req)){
    const result = await prisma.task.update({
      where:{
        id: parseInt(req.params.id),
      },
      data : payload,
    });
    
    res.json(result);
  } else{
    const error = new Error(`This user does not have a task with this id: ${req.params.id}`);
    res.status(422);
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id);
  if(await utils.isTaskOwnedByUser(id, req)){
    const deletedTask = await prisma.task.delete({
      where:{
        id: id,
      }
    });
    res.json(
      deletedTask
    )
  }else{
    const error = new Error(`This user does not have a task with this id: ${req.params.id}`);
    res.status(422);
    next(error);
  }
})

module.exports = router;