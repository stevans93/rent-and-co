import { Request, Response, NextFunction } from "express";
import Inquiry from "../../models/inquiry";
import Resource from "../../models/resource";
import { NotFoundError, BadRequestError } from "../../utils/errors";

/**
 * POST /api/inquiries
 * Kreiranje novog upita za resurs
 */
export const createInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resourceId, senderName, senderEmail, senderPhone, text } = req.body;

    // Get resource and owner
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new NotFoundError("Resurs nije pronađen");
    }

    if (resource.status !== "active") {
      throw new BadRequestError("Nije moguće poslati upit za neaktivan resurs");
    }

    const inquiry = new Inquiry({
      resourceId,
      ownerId: resource.ownerId,
      senderName,
      senderEmail,
      senderPhone: senderPhone || "",
      text,
      status: "pending",
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      data: inquiry,
      message: "Upit je uspešno poslat",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/inquiries
 * Lista upita za vlasnika (auth required)
 */
export const getInquiries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { resourceId, status, page = "1", limit = "20" } = req.query;

    // Build filter
    const filter: any = { ownerId: req.user._id };

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("resourceId", "title slug images")
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: inquiries,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/inquiries/:id
 * Detalji upita (auth required, owner only)
 */
export const getInquiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { id } = req.params;

    const inquiry = await Inquiry.findOne({ _id: id, ownerId: req.user._id })
      .populate("resourceId", "title slug images pricePerDay currency")
      .lean();

    if (!inquiry) {
      throw new NotFoundError("Upit nije pronađen");
    }

    // Mark as read if pending
    if (inquiry.status === "pending") {
      await Inquiry.updateOne({ _id: id }, { status: "read" });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/inquiries/:id/status
 * Ažuriranje statusa upita (auth required, owner only)
 */
export const updateInquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: id, ownerId: req.user._id },
      { status },
      { new: true }
    );

    if (!inquiry) {
      throw new NotFoundError("Upit nije pronađen");
    }

    res.status(200).json({
      success: true,
      data: inquiry,
      message: "Status upita je ažuriran",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/inquiries/:id
 * Brisanje upita (auth required, owner only)
 */
export const deleteInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const { id } = req.params;

    const inquiry = await Inquiry.findOneAndDelete({ 
      _id: id, 
      ownerId: req.user._id 
    });

    if (!inquiry) {
      throw new NotFoundError("Upit nije pronađen");
    }

    res.status(200).json({
      success: true,
      message: "Upit je uspešno obrisan",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/inquiries/stats
 * Statistika upita za vlasnika (auth required)
 */
export const getInquiryStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new NotFoundError("Korisnik nije pronađen");
    }

    const stats = await Inquiry.aggregate([
      { $match: { ownerId: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      read: 0,
      replied: 0,
      closed: 0,
    };

    stats.forEach((s) => {
      result[s._id as keyof typeof result] = s.count;
      result.total += s.count;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
