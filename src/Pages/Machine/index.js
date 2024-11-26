import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Alert,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  // Select,
  Popconfirm,
  Space,
  message,
  // Spin,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  WarningOutlined,
  LineChartOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import API_ENDPOINTS from "../../Config/config";
import axios from "axios";

const { Title } = Typography;
// const { Option } = Select;

const Machine = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKiln, setEditingKiln] = useState(null);
  const [kilns, setKilns] = useState([]);

  const [form] = Form.useForm();

  // const WORKING_STATUS = {
  //   NOT_STARTED: "not_started",
  //   STARTED: "started",
  //   HOLD: "hold",
  //   SHUT_DOWN: "shut_down",
  // };
  const fetchKilns = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MACHINE);
      setKilns(response.data.result);
    } catch (error) {
      console.error("Failed to fetch kilns:", error);
      message.error("Failed to fetch kiln data");
    }
  };

  useEffect(() => {
    console.log("apiendposuiwth", API_ENDPOINTS.MACHINE);
    fetchKilns();
  }, []);

  const handleAddKiln = async (values) => {
    try {
      const payload = {
        name: values.name,
        capacity: values.capacity,
      };

      await axios.post(API_ENDPOINTS.MACHINE, payload);
      message.success("Kiln added successfully!");

      fetchKilns();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to add kiln:", error);
      message.error("Failed to add kiln");
    }
  };

  const handleEditKiln = async (values) => {
    try {
      const payload = {
        id: editingKiln._id,
        name: values.name,
        capacity: values.capacity,
      };

      await axios.post(API_ENDPOINTS.MACHINE, payload);
      message.success("Kiln updated successfully!");

      await fetchKilns();
      setIsModalOpen(false);

      setIsModalOpen(false);
      setEditingKiln(null);
      form.resetFields();
    } catch (error) {
      console.error("Failed to edit kiln:", error);
      message.error("Failed to update kiln");
    }
  };

  const handleDeleteKiln = async (kiln) => {
    try {
      const payload = {
        id: kiln._id,
        status: "inactive",
      };

      await axios.post(API_ENDPOINTS.MACHINE, payload);
      message.success("Kiln deleted successfully!");
      await fetchKilns();
    } catch (error) {
      console.error("Failed to delete kiln:", error);
      message.error("Failed to delete kiln");
    }
  };
  const showEditModal = (kiln) => {
    setEditingKiln(kiln);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: kiln.name,
      capacity: kiln.capacity,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Running":
        return "bg-green-100 text-green-700";
      case "On-Hold":
        return "bg-yellow-100 text-yellow-700";
      case "Shutdown":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 relative">
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "50px" }}
      >
        <Title level={4} className="m-0">
          Kiln Operations
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingKiln(null);
            setIsModalOpen(true);
            form.resetFields();
          }}
        >
          Add New Kiln
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {kilns.map((kiln) => (
          <Col xs={24} lg={12} key={kiln.id}>
            <Card
              className={`${getStatusColor(kiln.working_status)} border-0`}
              extra={
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(kiln)}
                  />
                  <Popconfirm
                    title="Delete Kiln"
                    description="Are you sure you want to delete this kiln?"
                    onConfirm={() => handleDeleteKiln(kiln)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              }
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <LineChartOutlined className="text-lg" />
                  <span className="font-medium">{kiln.name}</span>
                </div>
                <span>{kiln.working_status}</span>
              </div>

              <div className="mb-4">
                <div>Capacity: {kiln.capacity}</div>
                Last updated: {new Date(kiln.updatedAt).toLocaleString()}
              </div>

              <div className="mb-4">
                <Title level={5} className="mb-3">
                  Status Control
                </Title>
                <Row gutter={16}>
                  <Col>
                    <Button
                      type="primary"
                      className="bg-green-500 hover:bg-green-600"
                      icon={<PlayCircleOutlined />}
                    >
                      Start
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      icon={<PauseCircleOutlined />}
                    >
                      Hold
                    </Button>
                  </Col>
                  <Col>
                    <Button danger icon={<CloseCircleOutlined />}>
                      Shutdown
                    </Button>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <Title level={5} className="mb-3">
                  Material Feed
                </Title>
                <Input placeholder="Set Material Feed" />
              </div>

              {kiln.id === 1 && (
                <Alert
                  message="Monitor temperature and pressure levels closely"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        title={editingKiln ? "Edit Kiln" : "Add New Kiln"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingKiln(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingKiln ? handleEditKiln : handleAddKiln}
        >
          <Form.Item
            name="name"
            label="Kiln Name"
            rules={[{ required: true, message: "Please enter kiln name" }]}
          >
            <Input placeholder="Enter kiln name" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity (Ton/h)"
            rules={[{ required: true, message: "Please enter capacity" }]}
          >
            <Input type="number" placeholder="Enter capacity" />
          </Form.Item>

          {/* <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value={WORKING_STATUS.NOT_STARTED}>Not Started</Option>
              <Option value={WORKING_STATUS.STARTED}>Started</Option>
              <Option value={WORKING_STATUS.HOLD}>On-Hold</Option>
              <Option value={WORKING_STATUS.SHUT_DOWN}>Shutdown</Option>
            </Select>
          </Form.Item> */}
          <Form.Item className="mb-0">
            <Row gutter={16} justify="end">
              <Col>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingKiln(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  {editingKiln ? "Save Changes" : "Add Kiln"}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Machine;
