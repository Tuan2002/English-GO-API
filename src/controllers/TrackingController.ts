import { IExamTrackingRequest } from "@/interfaces/tracking/ITrackingDTO";
import { ITrackingService } from "@/interfaces/tracking/ITrackingService";
import { GET, POST, route } from "awilix-express";
import { Request, Response } from "express";

@route("/tracking")
export class TrackingController {

    private readonly _trackingService: ITrackingService;
    constructor(TrackingService: ITrackingService) {
        this._trackingService = TrackingService;
    }

    @GET()
    @route("/exam-sessions")
    async getExamTurns(req: Request, res: Response) {
        const response = await this._trackingService.getExamSessions();
        res.status(response.status).json(response);
    }
    @POST()
    @route("/exam-results")
    async getExamResults(req: Request, res: Response) {
        const trackingDto: IExamTrackingRequest = req.body;
        const response = await this._trackingService.getExamResults(trackingDto);
        res.status(response.status).json(response);
    }
}