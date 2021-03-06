import { getSession } from "next-auth/client"
import type { NextApiResponse, NextApiRequest } from 'next'
import prisma from '../../../../lib/prisma'
import { getDaysLater, getFirstDayMonth } from "../../../../helpers/datetime"

// * GET GROUP
/*
groupData on success
groupData.enterKey on admin
on fail deliver groupNotFound: true
*/

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  const { groupName } = req.query

// 2021-09-03T03:04:04.727Z

  try{
    if(!session){
      throw Error("who r u")
    }
    if(typeof groupName == 'string'){
      const group = await prisma.group.findUnique({
        where:{
          name: groupName
        },
        include:{
          author: true,
          schedules: {
            include:{
              author : {
                select:{
                  id:true,
                  name:true,
                  email:true
                }
              },
              users:{
                select:{
                  id:true
                }
              }
            }
          },
          users: {
            select:{
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      if(!group){
        throw Error("group not found")
      }

      const isAdmin = session.id == group.authorId

      let tmp = group.schedules.filter(schedule=>
        schedule.startTime >= getDaysLater(-40) && schedule.startTime < getDaysLater(40) 
      )
      tmp.sort((a,b)=>{
        if(a.startTime > b.startTime){
          return 1
        }
        if(a.startTime < b.startTime){
          return -1
        }
        return 0
      })
      group.schedules = tmp

      let memberList = group.users

      const checkMember = (e)=> e.email == session.user.email

      res.send({
        groupData: {
          id: group.id,
          name: group.name,
          about: group.about,
          author: {
            id: group.author.id,
            name: group.author.name,
            image: group.author.image,
            username: group.author.username,
            email: group.author.email
          },
          admin: isAdmin,
          member: group.users.some(checkMember), 
          ...(isAdmin && {enterKey: group.enterKey}),
          // ...(isAdmin && {memberList}),
          memberList,
          schedules: group.schedules
        }
      })
    }
    else{
      throw Error("invalid query")
    }
  }catch(err){
    res.send({
      message: err.message,
      groupNotFound: true
    })
  }
}