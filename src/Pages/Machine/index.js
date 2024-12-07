import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  // Alert,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  Select,
  Popconfirm,
  Space,
  message,
  Table,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import API_ENDPOINTS from "../../Config/config";
import axios from "axios";
import { FaEye } from "react-icons/fa";

const { Title } = Typography;
const { Option } = Select;

const Machine = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMachineModalOpen, SetIsMachineModalOpen] = useState(false);
  const [editingKiln, setEditingKiln] = useState(null);
  const [kilns, setKilns] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currentKilnId, setCurrentKilnId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [selectedMachineIndex, setSelectedMachineIndex] = useState(null);
  const [reload, setReload] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [form] = Form.useForm();

  const WORKING_STATUS = {
    NOT_STARTED: "not_started",
    STARTED: "started",
    HOLD: "hold",
    SHUT_DOWN: "shut_down",
  };
  const fetchKilns = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MACHINE);
      setKilns(response.data.result);
    } catch (error) {
      console.error("Failed to fetch kilns:", error);
      message.error("Failed to fetch kiln data");
    }
  };

  const handleAddKiln = async (values) => {
    try {
      const payload = {
        name: values.name,
        capacity: values.capacity,
      };
      await axios.post(API_ENDPOINTS.MACHINE, payload);
      message.success("Kiln added successfully!");
      fetchKilns();
      SetIsMachineModalOpen(false);
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
      SetIsMachineModalOpen(false);
      setReload(!reload);
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
      setReload(!reload);
    } catch (error) {
      console.error("Failed to delete kiln:", error);
      message.error("Failed to delete kiln");
    }
  };
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MATERIAL);
      setMaterials(response.data.result);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      message.error("Failed to fetch material data");
    }
  };
  const handleStatusUpdate = async (kilnId, status, clickedIndex) => {
    try {
      setCurrentKilnId(kilnId);
      const payload = {
        id: kilnId,
        working_status: status,
      };
      await axios.post(API_ENDPOINTS.MACHINE, payload);
      if (status === WORKING_STATUS.STARTED) {
        if (kilns[clickedIndex]?.KilnMaterial?.length === 0) {
          setIsModalOpen(true);
        }
      }
      message.success(`Kiln status updated to ${status} successfully!`);
      setReload(!reload);
    } catch (error) {
      console.error("Failed to update kiln status:", error);
      message.error("Failed to update kiln status");
    }
  };
  const showEditModal = (kiln) => {
    setEditingKiln(kiln);
    SetIsMachineModalOpen(true);
    form.setFieldsValue({
      name: kiln.name,
      capacity: kiln.capacity,
    });
  };
  const getCardStyle = (status) => {
    switch (status) {
      case WORKING_STATUS.STARTED:
        return { backgroundColor: "#d4edda", color: "#155724" }; // Green
      case WORKING_STATUS.HOLD:
        return { backgroundColor: "#fff3cd", color: "#856404" }; // Yellow
      case WORKING_STATUS.SHUT_DOWN:
        return { backgroundColor: "#f8d7da", color: "#721c24" }; // Red
      default:
        return { backgroundColor: "#D3D3D3", color: "#333" }; // Default
    }
  };

  const handleSaveMaterial = async (values) => {
    const { material_id, quantity } = values;

    try {
      const payload = {
        material_id: material_id,
        kiln_id: currentKilnId,
        quantity: quantity,
      };
      if (isEditMode) {
        payload.id = editingRecord.key;
        payload.material_id = material_id;
        payload.kiln_id = currentKilnId;
      }
      let result;
      if (isEditMode) {
        result = await axios.post(
          `${API_ENDPOINTS.MACHINE_MATERIAL_ADD}`,
          payload
        );
      } else {
        result = await axios.post(
          `${API_ENDPOINTS.MACHINE_MATERIAL_ADD}`,
          payload
        );
      }

      if (result) {
        setReload(true);
        setIsEditMode(false);
        setEditingRecord(null);
        setReload(!reload);
        setIsAddMaterialModalOpen(false);
        message.success(
          isEditMode
            ? "Material updated successfully!"
            : "Material added successfully!"
        );

        form.resetFields();
      }
    } catch (error) {
      console.error("Failed to add material:", error);
      message.error("Failed to add material");
    }
  };
  const handleEditMaterial = async (values) => {
    try {
      fetchMaterials();
      form.setFieldsValue({
        id: values.key,
        quantity: values.quantity,
      });
      setIsAddMaterialModalOpen(true);
      setIsEditMode(true);
      setEditingRecord(values);
    } catch (error) {
      message.error("Failed to update material");
      console.error(error);
    }
  };
  const handleDeleteMaterial = async (record) => {
    try {
      const payload = {
        id: record.key,
        status: "inactive",
      };

      console.log("payloadd", payload);

      const result = await axios.post(
        `${API_ENDPOINTS.MACHINE_MATERIAL_ADD}`,
        payload
      );

      if (result) {
        setReload(!reload);
        message.success("Material deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete material:", error);
      message.error("Failed to delete material");
    }
  };
  const handleQuantityChange = (e) => {
    const inputQuantity = parseFloat(e.target.value);
    setQuantity(inputQuantity);
  };

  useEffect(() => {
    fetchKilns();
    fetchMaterials();
  }, [reload]);

  return (
    <div className="relative">
      <div style={{ marginBottom: "50px" }}>
        <Title level={4} className="m-0">
          Kiln Operations
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingKiln(null);
            SetIsMachineModalOpen(true);
            form.resetFields();
          }}
        >
          Add New Kiln
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {kilns &&
          kilns.length > 0 &&
          kilns.map((kiln, index) => (
            <Col xs={6} lg={6} key={kiln.id}>
              <Card
                title={kiln.name}
                style={getCardStyle(kiln.working_status)}
                extra={
                  <Row>
                    <Col span={16}>
                      <Space></Space>
                    </Col>
                    <Col span={16}>
                      <Space>
                        <FaEye
                          onClick={() => {
                            setIsModalOpen(true);
                            setSelectedMachineIndex(index);
                            setCurrentKilnId(kiln._id);
                          }}
                          className="mouse-pointer"
                        />
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
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Space>
                    </Col>
                  </Row>
                }
              >
                <div className="mb-4">
                  <h3>
                    {kiln.working_status === WORKING_STATUS.NOT_STARTED
                      ? "Not Started"
                      : kiln.working_status === WORKING_STATUS.HOLD
                      ? " On Hold"
                      : kiln.working_status === WORKING_STATUS.STARTED
                      ? "Running"
                      : "Shut Down"}
                  </h3>
                  <p>Capacity: {kiln.capacity} (Ton/h)</p>
                  <p>
                    Last updated: {new Date(kiln.updatedAt).toLocaleString()}
                  </p>
                  <p>Production : {kiln.totalProduction}</p>
                </div>
                <div className="mb-4">
                  <Title level={5} className="mb-3">
                    Status Control
                  </Title>
                  <Row gutter={16}>
                    {kiln.working_status !== WORKING_STATUS.STARTED && (
                      <Col>
                        <Button
                          className="running"
                          type="primary"
                          onClick={() => {
                            handleStatusUpdate(
                              kiln._id,
                              WORKING_STATUS.STARTED,
                              index
                            );
                            setSelectedMachineIndex(index);
                          }}
                          icon={<PlayCircleOutlined />}
                        >
                          Start
                        </Button>
                      </Col>
                    )}

                    {kiln.working_status === WORKING_STATUS.STARTED && (
                      <>
                        <Col>
                          <Button
                            className="hold"
                            onClick={() =>
                              handleStatusUpdate(
                                kiln._id,
                                WORKING_STATUS.HOLD,
                                index
                              )
                            }
                            icon={<PauseCircleOutlined />}
                          >
                            Hold
                          </Button>
                        </Col>
                        <Col>
                          <Button
                            className="shutdown"
                            icon={<CloseCircleOutlined />}
                            onClick={() =>
                              handleStatusUpdate(
                                kiln._id,
                                WORKING_STATUS.SHUT_DOWN,
                                index
                              )
                            }
                          >
                            Shutdown
                          </Button>
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
      </Row>
      <Modal
        title={editingKiln ? "Edit Kiln" : "Add New Kiln"}
        open={isMachineModalOpen}
        onCancel={() => {
          SetIsMachineModalOpen(false);
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

      <Modal
        title="Material List"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsAddMaterialModalOpen(true);
              fetchMaterials();
            }}
          >
            Add Material
          </Button>
        }
      >
        <Table
          dataSource={kilns[selectedMachineIndex]?.KilnMaterial?.map(
            (item, index) => ({
              key: item._id,
              name: item.material_id.name,
              quantity: item.quantity,
            })
          )}
          columns={[
            {
              title: "Material Name",
              dataIndex: "name",
              key: "name",
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: "Actions",
              key: "actions",
              render: (records) => (
                <Space size="middle">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      handleEditMaterial(records);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="danger"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: "Are you sure you want to delete this material?",
                        content: `Material: ${records.name}`,
                        onOk() {
                          handleDeleteMaterial(records);
                        },
                      });
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={false}
        />
      </Modal>

      <Modal
        title={isEditMode ? "Edit Material" : "Add Material"}
        open={isAddMaterialModalOpen}
        onCancel={() => {
          setIsAddMaterialModalOpen(false);
          setIsEditMode(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleSaveMaterial}>
          <Form.Item
            label="Select Material"
            name="material_id"
            rules={[{ required: true, message: "Please select a material" }]}
          >
            <Select placeholder="Select a material" style={{ width: "100%" }}>
              {materials.map((material) => (
                <Option key={material.id} value={material.id}>
                  {material.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              { required: true, message: "Please enter a quantity" },
              {
                validator: (_, value) => {
                  if (value > 100) {
                    return Promise.reject(
                      new Error("Quantity cannot exceed 100")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter quantity"
              onChange={handleQuantityChange}
              max={100}
            />
          </Form.Item>
          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Button
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                disabled={quantity > 100}
              >
                {isEditMode ? "Update" : "Add"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Machine;
