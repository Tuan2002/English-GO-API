import { TimeConstant } from "@/constants/TimeConstant";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IRedisService from "@/interfaces/cache/IRedisService";
import { IExamTrackingRequest } from "@/interfaces/tracking/ITrackingDTO";
import { ITrackingService } from "@/interfaces/tracking/ITrackingService";
import axios, { HttpStatusCode } from "axios";
import { parse } from "node-html-parser";

export class TrackingService implements ITrackingService {
  private readonly _redisService: IRedisService;
  constructor(RedisService: IRedisService) {
    this._redisService = RedisService;
    // Initialize any properties or dependencies here
  }

  async getExamSessions(): Promise<IResponseBase> {
    try {
      // Check if the data is already cached in Redis
      const cacheKey = "EXAM_SESSION_CACHE";
      const cachedData = this._redisService.isRedisConnected() ? await this._redisService.getDataAsync(cacheKey) : null;
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return {
          status: HttpStatusCode.Ok,
          success: true,
          message: "Exam sessions fetched from cache",
          data: parsedData,
        };
      }

      // If not cached, fetch the data from the external service
      const response = await axios.post(`${process.env.VSTEP_TRACKER_URL}/tra-cuu-ket-qua.aspx`);
      const document = parse(response?.data);

      const examSessionElement = document.querySelector('[name="ctl00$ContentPlaceHolderExam$fExam"]');
      const signatureElement = document.querySelector('input[name="__VIEWSTATE"]');
      const examSessionOptions = examSessionElement?.querySelectorAll("option");
      const examSessions = examSessionOptions?.map((option) => {
        const value = option.getAttribute("value");
        const text = option.text;
        return {
          value,
          text,
        };
      });
      const signature = signatureElement?.getAttribute("value");
      const data = {
        examSessions: examSessions?.length > 0 ? examSessions : [],
        signature: signature,
      };
      if (examSessions?.length > 0 && signature && this._redisService.isRedisConnected()) {
        // Cache the data in Redis
        const cacheValue = JSON.stringify(data);
        await this._redisService.setDataAsync(cacheKey, cacheValue, {
          EX: TimeConstant.REDIS_EXPIRE_TIME,
        });
      }
      return {
        status: response.status,
        success: true,
        message: "Exam sessions fetched successfully",
        data: data,
      };
    } catch (error) {
      return {
        status: HttpStatusCode.InternalServerError,
        success: false,
        message: "Failed to fetch exam sessions",
        data: null,
        error: {
          message: error.message,
          errorDetail: error.stack,
        },
      };
    }
  }
  async getExamResults(trackingDto: IExamTrackingRequest): Promise<IResponseBase> {
    try {
      // Check if the data is already cached in Redis
      const cacheKey = `EXAM_RESULT_CACHE_${trackingDto.studentCode}_${trackingDto.examSessionId}`;
      const cachedData = this._redisService.isRedisConnected() ? await this._redisService.getDataAsync(cacheKey) : null;
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return {
          status: HttpStatusCode.Ok,
          success: true,
          message: "Exam results fetched from cache",
          data: parsedData,
        };
      }

      // If not cached, fetch the data from the external service
      const formBody = {
        __VIEWSTATE: trackingDto.signature,
        ctl00$ContentPlaceHolderExam$fExam: trackingDto.examSessionId,
        ctl00$ContentPlaceHolderExam$fBoard: trackingDto.locationId,
        ctl00$ContentPlaceHolderExam$fCerti: trackingDto.languageId,
        ctl00$ContentPlaceHolderExam$fSBD: trackingDto.studentCode,
      };

      const response = await axios.post(`${process.env.VSTEP_TRACKER_URL}/tra-cuu-ket-qua.aspx`, formBody, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const document = parse(response?.data);
      const resultElement = document.querySelector('table[id="gridview"]');
      const resultBody = resultElement?.querySelector("tbody");
      const resultRows = resultBody?.querySelectorAll("tr");
      const results = resultRows?.map((row) => {
        const columns = row.querySelectorAll("td");
        const data = {
          index: columns[0]?.text,
          studentCode: columns[1]?.text,
          fullName: columns[2]?.text,
          dateOfBirth: columns[3]?.text,
          listeningScore: columns[4]?.text,
          readingScore: columns[5]?.text,
          writingScore: columns[7]?.text,
          speakingScore: columns[6]?.text,
          totalScore: columns[8]?.text,
          level: columns[9]?.text,
        };
        return data;
      });
      if (results?.length > 0 && this._redisService.isRedisConnected()) {
        // Cache the data in Redis
        const cacheValue = JSON.stringify(results);
        await this._redisService.setDataAsync(cacheKey, cacheValue, {
          EX: TimeConstant.REDIS_EXPIRE_TIME,
        });
      }
      return {
        status: response.status,
        success: true,
        message: "Exam results fetched successfully",
        data: results && results?.length > 0 ? results : [],
      };
    } catch (error) {
      return {
        status: HttpStatusCode.InternalServerError,
        success: false,
        message: "Failed to fetch exam results",
        data: null,
        error: {
          message: error.message,
          errorDetail: error.stack,
        },
      };
    }
  }
}
