const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient

async function isTaskOwnedByUser(id, req){
  const task = await prisma.task.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if(task){
    return await isBoardOwnedByUser(task.boardId, req);
  }else{
    return false;
  }

}

async function isBoardOwnedByUser(id, req){
  const result = await prisma.board.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if(result){
    if(result.userId == req.user.id){
      return true;
    }else{
      return false;
    }
  }else{
    return false;
  }
}

module.exports = {
  isBoardOwnedByUser,
  isTaskOwnedByUser
}