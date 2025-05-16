const Employee = require("../models/employee");
const User = require("../models/user");

const createEmployee = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            position,
            shift,
            cinema_id
        } = req.body;

        if (await User.isEmailTaken(req.body.email)) {
            return res.status(409).send("Email đã tồn tại vui lòng chọn email khác!");
        }
        if (await User.isPhoneTaken(phone)) {
            return res.status(409).send("Số điện thoại đã tồn tại");
        }
        if (await User.isCccdTaken(cccd)) {
            return res.status(409).send("CCCD đã tồn tại");
        }
        if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
            return res.status(400).send("Mật khẩu phải chứa ít nhất 8 ký tự và chứa 1 số và 1 chữ cái.");
        }
        const employee = await Employee.create({
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            role: "employee",
            position,
            shift,
            cinema_id
        });
        return res.status(201).send({ employee });
    } catch (error) {
        console.error("Lỗi server!", error);
        return res.status(500).send("Đã xảy ra lỗi khi tạo nhân viên.");
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employeesRaw = await Employee.find()
            .populate({ path: "cinema_id", select: "name" });

        const employees = employeesRaw.map(emp => {
            const { cinema_id, ...rest } = emp.toObject();
            return {
                ...rest,
                cinema: {
                    cinema_id: cinema_id?._id,
                    name: cinema_id?.name,
                },
            };
        });

        return res.status(200).send(employees);
    } catch (error) {
        console.error("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employeeRaw = await Employee.findById(req.params.id)
            .populate({ path: "cinema_id", select: "name" });

        if (!employeeRaw) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }

        const { cinema_id, ...rest } = employeeRaw.toObject();
        const employee = {
            ...rest,
            cinema: {
                cinema_id: cinema_id?._id,
                name: cinema_id?.name,
            },
        };

        res.status(200).send(employee);
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
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
                    name: cinema_id?.name,
                },
            };
        });

        res.status(200).send(employees);
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
    }
};

const deleteEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }
        await Employee.findByIdAndDelete(req.params.id);
        res.status(204).send("Xóa nhân viên thành công");
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
    }
};

const updateEmployeeById = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            position,
            shift,
            cinema_id
        } = req.body;

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
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
        res.status(200).send(employee);
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
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