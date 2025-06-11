const Constraint = require("../models/constraint");

const createSetting = async (req, res) => {
    try {
        const existing = await Constraint.findOne();
        if (existing) {
            return res.status(400).json({ error: { message: "Cài đặt đã tồn tại. Hãy dùng API cập nhật." } });
        }

        const constraint = new Constraint(req.body);
        await constraint.save();

        return res.status(201).json(constraint);
    } catch (error) {
        console.error("Lỗi khi tạo setting:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getSetting = async (req, res) => {
    try {
        const constraint = await Constraint.findOne();
        if (!constraint) {
            return res.status(404).json({ error: { message: "Chưa có cài đặt hệ thống." } });
        }

        return res.status(200).json(constraint);
    } catch (error) {
        console.error("Lỗi khi lấy setting:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateSetting = async (req, res) => {
    try {
        const constraint = await Constraint.findOne();
        if (!constraint) {
            return res.status(404).json({ error: { message: "Chưa có cài đặt để cập nhật." } });
        }

        Object.assign(constraint, req.body);
        await constraint.save();

        return res.status(200).json(constraint);
    } catch (error) {
        console.error("Lỗi khi cập nhật setting:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

module.exports = {
    createSetting,
    getSetting,
    updateSetting
};