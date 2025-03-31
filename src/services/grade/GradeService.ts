import { ENV } from "@/constants/env";
import { ErrorMessages } from "@/constants/ErrorMessages";
import { ExamQuestion } from "@/entity/ExamQuestion";
import logger from "@/helpers/logger";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { IGradeQuestionRequest } from "@/interfaces/grade/IGradeDTO";
import IGradeService from "@/interfaces/grade/IGradeService";
import axios from "axios";
import { htmlToText } from "html-to-text";
import { StatusCodes } from "http-status-codes";
import DatabaseService from "../database/DatabaseService";

export default class GradeService implements IGradeService {
  private readonly _context: DatabaseService;
  constructor(DatabaseService: DatabaseService) {
    this._context = DatabaseService;
  }

  private createWritingEvaluationPrompt(essay: string, topic: string, level = "B1"): string {
    return `
    Bạn là giám khảo chấm thi viết tiếng Anh trình độ ${level}. Hãy đánh giá bài viết sau theo các tiêu chí:
    
    Đề bài: ${topic}
    Bài viết: ${essay}
    
    Hãy chấm điểm theo thang 10 và cung cấp nhận xét thật chi tiết về:
    1. Ngữ pháp (2 điểm)
    2. Từ vựng (2 điểm)
    3. Tính mạch lạc và liên kết (2 điểm)
    4. Hoàn thành yêu cầu đề bài (2 điểm)
    5. Độ phức tạp câu (2 điểm)
    
    Đưa ra các ví dụ cụ thể về lỗi (nếu có) và gợi ý cải thiện.
    Kết quả trả về dạng JSON với cấu trúc:
    {
        "score": tổng điểm,
        "grammar": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "vocabulary": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "coherence": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "task_achievement": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "sentence_complexity": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "overall_feedback": [nhận xét 1, nhận xét 2, ...],
        "corrected_essay": phiên bản đã sửa của bài viết hoặc bài viết mới nếu bài viết không đạt yêu cầu (quá ngắn hoặc không liên quan).
    }`;
  }

  private sanitizeHtmlContent(html: string) {
    return htmlToText(html, {
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
      preserveNewlines: false,
      uppercaseHeadings: false,
    });
  }

  private async getQuestionResult(examId: string, levelId: string): Promise<IResponseBase> {
    try {
      if (!examId || !levelId) {
        return {
          data: null,
          message: "Missing examId or levelId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const result = await this._context.ExamQuestionRepo.createQueryBuilder("exam_question")
        .leftJoinAndSelect("exam_question.exam", "exam")
        // .leftJoinAndSelect("exam_question.level", "level")
        .leftJoinAndSelect("exam_question.question", "question")
        .leftJoinAndSelect("exam_question.examResultWritings", "examResultWritings")
        .where("exam_question.examId = :examId", { examId })
        .andWhere("exam_question.levelId = :levelId", { levelId })
        .getOne();
      if (!result) {
        return {
          data: null,
          message: "No result found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      return {
        data: result,
        message: "Get question result successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(`Error in GradeService - method getQuestionResult() at ${new Date().getTime()} with message ${error?.message}`);
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async gradeWritingWithAI(gradeData: IGradeQuestionRequest): Promise<IResponseBase> {
    try {
      const { examId, levelId } = gradeData;
      if (!examId || !levelId) {
        return {
          data: null,
          message: "Missing examId or levelId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }

      const result = await this.getQuestionResult(examId, levelId);
      if (!result.success) {
        return result;
      }

      const examQuestion = result.data as ExamQuestion;
      console.log("Exam question:", examQuestion);
      const essay = this.sanitizeHtmlContent(examQuestion.examResultWritings[0].data);
      const topic = this.sanitizeHtmlContent(
        examQuestion.question.description + examQuestion.question.questionContent + examQuestion.question.questionNote
      );
      const prompt = this.createWritingEvaluationPrompt(essay, topic, "B1");

      const API_URL = `${ENV.GEMINI_API_URL}?key=${ENV.GEMINI_API_KEY}`;
      const body = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const response = await axios.post(API_URL, body, { headers });

      console.log("AI response:", response.data.candidates[0].content);
      // Xử lý response để tránh circular structure
      let answer = response.data.candidates[0].content?.parts[0]?.text;
      let evaluation;

      try {
        answer = answer.replace("```json", "").replace("```", "");
        evaluation = answer ? JSON.parse(answer) : { raw: answer };
      } catch (e) {
        evaluation = {
          error: "Failed to parse AI response",
          raw: answer,
        };
      }

      return {
        data: evaluation,
        message: "Grading completed successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.error(
        `Error in GradeService - method gradeWritingWithAI() at ${new Date().getTime()} with message ${error?.message}`
      );

      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.stack,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async gradeSpeakingWithAI(gradeData: IGradeQuestionRequest): Promise<IResponseBase> {
    try {
      // Simulate AI grading process
      //   const result = await this._context.GradeRepo.gradeSpeaking(id);
      //   return {
      //     data: result,
      //     message: "Grading completed successfully",
      //     success: true,
      //     error: null,
      //     status: StatusCodes.OK,
      //   };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method gradeSpeakingWithAI() at ${new Date().getTime()} with message ${error?.message}`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
