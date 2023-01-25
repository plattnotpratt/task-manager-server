const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const utils = require('./utils');

router.get('/', async (req, res) => {
  const userId = req.user.id;
  const result = await prisma.board.findMany({
    where:{
      userId: userId,
    },
    include:{
      tasks: true,
    }
  });
  if(result){
    res.json(result);
  }
});

router.get('/:id',async(req, res)=>{
  const result = await prisma.board.findUnique({
    where:{
      id: parseInt(req.params.id),
    },
    include:{
      tasks: true,
    },
  });
  if(result){
    res.json(result);
  }
});

router.post('/', async (req, res, next) => {
  
  const payload = {
    title: req.body.title,
    description: req.body.description,
    userId: parseInt(req.user.id),
  };
  const createdTask = await prisma.board.create({
    data:payload,
  });
  res.json(createdTask);
});

router.put('/:id', async (req, res, next) => {
  const payload = {
    title: req.body.title,
    description: req.body.description,
  }
  if(await utils.isBoardOwnedByUser(req.params.id, req)){
    const result = await prisma.board.update({
      where:{
        id: parseInt(req.params.id),
      },
      data : payload,
    });
    
    res.json(result);
  } else{
    const error = new Error(`This user does not have a board with this id: ${req.params.id}`);
    res.status(422);
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id);
  if(await utils.isBoardOwnedByUser(id, req)){
    const deleteAllTasks = prisma.task.deleteMany({
      where: {
        boardId: id,
      },
    });
    const deleteBoard = prisma.board.delete({
      where: {
        id: id,
      }
    })
    const transaction = await prisma.$transaction([deleteAllTasks, deleteBoard]);
    res.json(
      transaction,
    );
  }else{
    const error = new Error(`This user does not have a board with this id: ${req.params.id}`);
    res.status(422);
    next(error);
  }
})

module.exports = router;