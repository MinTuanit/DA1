const Employee = require("../models/employee");
const User = require("../models/user");
const Setting = require("../models/constraint");

const createEmployee = async (req, res) => {
    try {
        const {
            full_name, email, phone, password, cccd,
            dateOfBirth, position, shift, cinema_id
        } = req.body;

        if (await User.isEmailTaken(email)) {
            return res.status(409).json({ error: { message: "Email đã tồn tại, vui lòng chọn email khác!" } });
        }
        if (await User.isPhoneTaken(phone)) {
            return res.status(409).json({ error: { message: "Số điện thoại đã tồn tại" } });
        }
        if (await User.isCccdTaken(cccd)) {
            return res.status(409).json({ error: { message: "CCCD đã tồn tại" } });
        }

        if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
            return res.status(400).json({ error: { message: "Mật khẩu phải chứa ít nhất 1 số và 1 chữ cái." } });
        }

        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(500).json({ error: { message: "Không tìm thấy cài đặt hệ thống." } });
        }

        const { employee_min_age, employee_max_age } = setting;

        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        if (age < employee_min_age || age > employee_max_age) {
            return res.status(400).json({ error: { message: `Tuổi nhân viên phải nằm trong khoảng từ ${employee_min_age} đến ${employee_max_age}.` } });
        }

        const employee = await Employee.create({
            full_name, email, phone, password, cccd,
            dateOfBirth, role: "employee", position, shift, cinema_id
        });

        return res.status(201).json({ employee });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Đã xảy ra lỗi khi tạo nhân viên." } });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employeesRaw = await Employee.find().populate({ path: "cinema_id", select: "name" });
        const employees = employeesRaw.map(emp => {
            const { cinema_id, ...rest } = emp.toObject();
            return {
                ...rest,
                cinema: {
                    cinema_id: cinema_id?._id,
                    name: cinema_id?.name
                }
            };
        });
        return res.status(200).json(employees);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employeeRaw = await Employee.findById(req.params.id)
            .populate({ path: "cinema_id", select: "name" });

        if (!employeeRaw) {
            return res.status(404).json({ error: { message: `Không tìm thấy nhân viên có id: ${req.params.id}` } });
        }

        const { cinema_id, ...rest } = employeeRaw.toObject();
        const employee = {
            ...rest,
            cinema: {
                cinema_id: cinema_id?._id,
                name: cinema_id?.name
            }
        };

        return res.status(200).json(employee);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getEmployeesByCinemaId = async (req, res) => {
    try {
        const cinemaId = req.params.cinemaid;

        const employeesRaw = await Employee.find({ cinema_id: cinemaId })
            .populate({ path: "cinema_id", select: "name" });

        const employees = employeesRaw.map(emp => {
            const { cinema_id, ...rest } = emp.toObject();
            return {
                ...rest,
                cinema: {
                    cinema_id: cinema_id?._id,
                    name: cinema_id?.name
                }
            };
        });

        return res.status(200).json(employees);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const deleteEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: { message: `Không tìm thấy nhân viên có id: ${req.params.id}` } });
        }

        await Employee.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Xóa nhân viên thành công" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const updateEmployeeById = async (req, res) => {
    try {
        const {
            full_name, email, phone, password, cccd,
            dateOfBirth, position, shift, cinema_id
        } = req.body;

        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(500).json({ error: { message: "Không tìm thấy cài đặt hệ thống." } });
        }

        const { employee_min_age, employee_max_age } = setting;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        if (age < employee_min_age || age > employee_max_age) {
            return res.status(400).json({ error: { message: `Tuổi nhân viên phải nằm trong khoảng từ ${employee_min_age} đến ${employee_max_age}.` } });
        }

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: { message: `Không tìm thấy nhân viên có id: ${req.params.id}` } });
        }

        if (full_name !== undefined) employee.full_name = full_name;
        if (email !== undefined) employee.email = email;
        if (phone !== undefined) employee.phone = phone;
        if (password !== undefined) employee.password = password;
        if (cccd !== undefined) employee.cccd = cccd;
        if (dateOfBirth !== undefined) employee.dateOfBirth = dateOfBirth;
        if (position !== undefined) employee.position = position;
        if (shift !== undefined) employee.shift = shift;
        if (cinema_id !== undefined) employee.cinema_id = cinema_id;

        await employee.save();
        return res.status(200).json(employee);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    deleteEmployeeById,
    updateEmployeeById,
    getEmployeesByCinemaId
};