import EGroupRole from "@/constants/GroupRole";
import { User } from "@/entity/User";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { ISetupService } from "@/interfaces/setup/ISetupService";
import Extensions from "@/utils/Extensions";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";

export class SetupService implements ISetupService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }
  async setupService(): Promise<IResponseBase> {
    try {
      // create group role
      const groupRoles = await this._context.GroupRoleRepo.find();
      if (!groupRoles || groupRoles.length === 0) {
        const newGroupRoles = [
          {
            id: EGroupRole.ADMIN,
            name: "admin",
            displayName: "Quản trị viên",
            description: "Quản trị viên hệ thống",
          },
          {
            id: EGroupRole.EXAMINER,
            name: "examiner",
            displayName: "Giáo viên chấm bài",
            description: "Giáo viên chấm bài",
          },
          {
            id: EGroupRole.CONTESTANT,
            name: "contestant",
            displayName: "Thí sinh dự thi",
            description: "Thí sinh tham gia thi thử",
          },
        ];
        await Promise.all(
          newGroupRoles.map((groupRole) => {
            const newGroupRole = this._context.GroupRoleRepo.create(groupRole);
            return this._context.GroupRoleRepo.save(newGroupRole);
          })
        );
      }
      // create admin user
      const admin = await this._context.UserRepo.findOne({
        where: {
          groupRoleId: EGroupRole.ADMIN,
        },
      });
      if (!admin) {
        const newAdmin = new User();
        newAdmin.username = "admin";
        newAdmin.password = Extensions.hashPassword("123123");
        newAdmin.groupRoleId = EGroupRole.ADMIN;
        newAdmin.fullName = "Admin";
        newAdmin.email = "admin@gmail.com";
        newAdmin.phoneNumber = "0123456789";
        newAdmin.birthday = "05/08/2003";
        newAdmin.isExternal = false;
        newAdmin.id = uuid();

        await this._context.UserRepo.save(newAdmin);
      }

      // create skills
      const skills = await this._context.SkillRepo.find();
      if (!skills || skills.length === 0) {
        const newSkills = [
          {
            id: "listening",
            name: "Listening",
            displayName: "Listening",
            description:
              "You will listen to a number of different recordings and you will have to answer questions based on what you hear. There will be time for you to read the questions and check your work.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354158/f8glkjhqfh3zqxhpjtej.png",
            order: 1,
            expiredTime: 47,
          },
          {
            id: "reading",
            name: "Reading",
            displayName: "Reading",
            description: "In this section, you will read several passages. Each one is followed by several questions about it.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354170/porws3ag9kdwg4pyyw5f.png",
            order: 2,
            expiredTime: 60,
          },
          {
            id: "writing",
            name: "Writing",
            displayName: "Writing",
            description: "You have to 60 minutes to completed two task of writing skill.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354194/ruenzkglapqvxtkmdz7y.png",
            order: 3,
            expiredTime: 60,
          },
          {
            id: "speaking",
            name: "Speaking",
            displayName: "Speaking",
            description:
              "There are three part in this level with three question. For each question in this level will have 1 minute for you to prepare.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354184/p0rvqerqzdnqlc7gclgt.png",
            order: 4,
            expiredTime: 60,
          },
        ];
        await Promise.all(
          newSkills.map((skill) => {
            const newSkill = this._context.SkillRepo.create(skill);
            return this._context.SkillRepo.save(newSkill);
          })
        );
      }
      const levels = await this._context.LevelRepo.find();
      if (!levels || levels.length === 0) {
        const listLevels = [
          {
            id: "listening-part-1",
            skillId: "listening",
            name: "Part 1",
            displayName: "Part 1",
            description:
              "In this part, you will hear EIGHT short recordings. The recordings will be played ONCE only. There is one question following each recording. For each question, choose the right answer A, B, C or D.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354225/dyybnixgup63nbcd9e6n.png",
            subQuestionNumber: 8,
          },
          {
            id: "listening-part-2",
            skillId: "listening",
            name: "Part 2",
            displayName: "Part 2",
            description:
              "In this part, you will hear THREE conversations. The conversations will be played ONCE only. There are four questions for each conversation. For each conversation, choose the right answer A, B, C or D.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354236/itdgce53xwgwcfi9dzmn.png",
            subQuestionNumber: 12,
          },
          {
            id: "listening-part-3",
            skillId: "listening",
            name: "Part 3",
            displayName: "Part 3",
            description:
              "In this part, you will hear THREE talks or lectures. The talks or lectures will be played ONCE only. There are five questions for each talk or lecture. For each question, choose the right answer A, B, C or D.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1728354244/siipnmwqv88tehls5t2v.png",
            subQuestionNumber: 15,
          },
          {
            id: "reading-part-1",
            skillId: "reading",
            name: "Part 1",
            displayName: "Part 1",
            description:
              "For questions 1 - 10, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basic of what is stated or implied in that message.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729652917/wagytwp51dytzjczjsv3.png",
            subQuestionNumber: 10,
          },
          {
            id: "reading-part-2",
            skillId: "reading",
            name: "Part 2",
            displayName: "Part 2",
            description:
              "For questions 12 - 20, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basic of what is stated or implied in that message.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729652942/snaue64kx0hfpwqivvmx.png",
            subQuestionNumber: 10,
          },
          {
            id: "reading-part-3",
            skillId: "reading",
            name: "Part 3",
            displayName: "Part 3",
            description:
              "For questions 21 - 30, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basic of what is stated or implied in that message.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729652961/l1caeczo9qyofzzrgtyr.png",
            subQuestionNumber: 10,
          },
          {
            id: "reading-part-4",
            skillId: "reading",
            name: "Part 4",
            displayName: "Part 4",
            description:
              "For questions 31 - 40, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basic of what is stated or implied in that message.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729652980/atiidoa7d4w9cuabaont.png",
            subQuestionNumber: 10,
          },
          {
            id: "speaking-part-1",
            skillId: "speaking",
            name: "Part 1",
            displayName: "Part 1",
            description: "You have 3 minute to complete this level. It wil start after 1 minute.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729657926/wtnkkxl1j1xo1ftagodf.png",
            subQuestionNumber: 0,
          },
          {
            id: "speaking-part-2",
            skillId: "speaking",
            name: "Part 2",
            displayName: "Part 2",
            description: "You have 4 minute to complete this level. It wil start after 1 minute.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729657935/ffoc1uvvfeclzys4wr2a.png",
            subQuestionNumber: 0,
          },
          {
            id: "speaking-part-3",
            skillId: "speaking",
            name: "Part 3",
            displayName: "Part 3",
            description:
              "In ther third part of the test, you will have one minute to prepare for a talk about the topic. You can develop the topic using the suggested indias in the mind map and/of your own ideas. Affter one minute you are supposed to talk about the topic for up to two minutes and answer the follow-up questions for up to two minutes.",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729657940/ihc53jmoaouwwcvn8zgi.png",
            subQuestionNumber: 0,
          },
          {
            id: "writing-part-1",
            skillId: "writing",
            name: "Part 1",
            displayName: "Part 1",
            description: "You should spend about 20 minutes on this task",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729657437/g7ywmicsbe8aeypax6zn.png",
            subQuestionNumber: 0,
          },
          {
            id: "writing-part-2",
            skillId: "writing",
            name: "Part 2",
            displayName: "Part 2",
            description: "You should spend about 20 minutes on this task",
            image: "https://res.cloudinary.com/domgx4abl/image/upload/v1729657442/cyyx5xtlz76ze5bj6tgr.png",
            subQuestionNumber: 0,
          },
        ];
        await Promise.all(
          listLevels.map((level) => {
            const newLevel = this._context.LevelRepo.create(level);
            return this._context.LevelRepo.save(newLevel);
          })
        );
      }

      return {
        data: null,
        message: "Setup data successfully",
        success: true,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        message: "Internal server error",
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: 500,
      };
    }
  }
}
