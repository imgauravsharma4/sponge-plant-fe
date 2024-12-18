import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  Select,
  Popconfirm,
  Space,
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
import { APIS } from "../../APIs/Apis";
import { options } from "../../Config/options";
import ToastMessage from "../../Component/ToastMessage/ToastMessage";
import { AiOutlinePlus } from "react-icons/ai";

const { Title } = Typography;
const { Option } = Select;
const {
  WORKING_STATUS,
  successMessage,
  errorMessage,
  messageStatus,
  defaultStatus,
} = options;

const Machine = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMachineModalOpen, SetIsMachineModalOpen] = useState(false);
  const [editMachineData, setEditMachineData] = useState(null);
  const [machines, setMachines] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currentMachineId, setCurrentMachineId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [selectedMachineIndex, setSelectedMachineIndex] = useState(null);
  const [reload, setReload] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [feedRate,setFeedRate]=useState(0)
  const [feedRateEdit,setFeedRateEdit]=useState(false)
  const [form] = Form.useForm();

  const fetchMachines = async () => {
    const response = await APIS.getAllMachine();
    setMachines(response);
  };
  const fetchMaterials = async () => {
    const response = await APIS.getAllMaterial();
    setMaterials(response);
  };

  const handleAddEditMachine = async (values, isDelete) => {
    let payload={}
    if (feedRate) {
      payload = {
        id: currentMachineId,
        feed_rate: feedRate,
      };
      setFeedRateEdit(false)
    } else {
      payload = {
        ...values,
        ...(editMachineData?._id &&
          editMachineData?._id?.length > 1 && {
            id: editMachineData._id,
          }),
        ...(isDelete && {
          id: values._id,
          status: defaultStatus.INACTIVE,
        }),
      };
    };
    APIS.addAndEditMachine(payload)
      .then((res) => {
        ToastMessage(
          messageStatus.SUCCESS,
          successMessage.UPDATE_SUCCESS_MESSAGE("Machine")
        );
        setReload(!reload);
        SetIsMachineModalOpen(false);
        setFeedRateEdit(false)
        setEditMachineData(null);

        form.resetFields();
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        ToastMessage(messageStatus.ERROR, errorMessage.SERVER_ERROR);
        SetIsMachineModalOpen(false);
        form.resetFields();
        setEditMachineData(null);
      });
  };

  const handleStatusUpdate = async (machineId, status, clickedIndex) => {
    setCurrentMachineId(machineId);
    const payload = {
      id: machineId,
      working_status: status,
    };
    APIS.addAndEditMachine(payload)
      .then((res) => {
        ToastMessage(
          messageStatus.SUCCESS,
          successMessage.UPDATE_SUCCESS_MESSAGE("Machine")
        );
        setReload(!reload);
        if (status === WORKING_STATUS.STARTED) {
          if (machines[clickedIndex]?.KilnMaterial?.length === 0) {
            setIsModalOpen(true);
          }
        }
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        ToastMessage(messageStatus.ERROR, errorMessage.SERVER_ERROR);
      });
  };
  const showEditModal = (kiln) => {
    setEditMachineData(kiln);
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

  const handleSaveMaterial = async (values, isDelete) => {
    
    const payload = {
      ...values,
      machine_id: currentMachineId,
      ...(isEditMode &&
        editingRecord &&
        editingRecord?.id?.length > 0 && {
          id: editingRecord.id,
        }),
      ...(isDelete && {
        status: defaultStatus.INACTIVE,
      }),


    };
    APIS.postMachineMaterial(payload)
      .then((res) => {
        ToastMessage(
          messageStatus.SUCCESS,
          successMessage.UPDATE_SUCCESS_MESSAGE("Material")
        );
        setReload(!reload);
        setIsEditMode(false);
        setEditingRecord(null);
        setIsAddMaterialModalOpen(false);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        ToastMessage(messageStatus.ERROR, errorMessage.SERVER_ERROR);
      });
  };
  const handleEditMaterial = async (values) => {
    form.setFieldsValue({
      id: values.id,
      quantity: values.quantity,
    });
    setIsAddMaterialModalOpen(true);
    setIsEditMode(true);
    setEditingRecord(values);
  };
  const handleQuantityChange = (e) => {
    const inputQuantity = parseFloat(e.target.value);
    setQuantity(inputQuantity);
  };

  const handleFeedEdit=()=>{
    setFeedRateEdit(true)
  }

  useEffect(() => {
    fetchMachines();
  }, [reload]);

  useEffect(() => {
    fetchMaterials();
  }, []);

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
            setEditMachineData(null);
            SetIsMachineModalOpen(true);
            form.resetFields();
          }}
        >
          Add New Kiln
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {machines &&
          machines.length > 0 &&
          machines.map((machine, index) => (
            <Col xs={6} lg={6} key={machine.id}>
              <Card
                title={machine.name}
                style={getCardStyle(machine.working_status)}
                extra={
                  <Row>
                    <Col span={16}>
                      <Space></Space>
                    </Col>
                    <Col span={16}>
                      <Space>
                        <AiOutlinePlus
                          onClick={() => {
                            setIsModalOpen(true);
                            setSelectedMachineIndex(index);
                            setCurrentMachineId(machine._id);
                          }}
                          className="mouse-pointer"
                        />

                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => showEditModal(machine)}
                        />
                        <Popconfirm
                          title="Delete Kiln"
                          description="Are you sure you want to delete this kiln?"
                          onConfirm={() => handleAddEditMachine(machine, true)}
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
                <div>
                  <h3>
                    {machine.working_status === WORKING_STATUS.NOT_STARTED
                      ? "Not Started"
                      : machine.working_status === WORKING_STATUS.HOLD
                      ? " On Hold"
                      : machine.working_status === WORKING_STATUS.STARTED
                      ? "Running"
                      : "Shut Down"}
                  </h3>
                  <p>
                    Material Mix :
                    {machine.MachineMaterial.length > 0
                      ? machine.MachineMaterial.map((item, index) => (
                          <span key={index} className="ms-1">
                            {item.material_id.name}({item.quantity}%)
                            {index < machine.MachineMaterial.length - 1
                              ? ", "
                              : ""}
                          </span>
                        ))
                      : "No Materials yet"}
                  </p>

                  <p>Capacity: {machine.capacity} (Ton/h)</p>
                  <p>Feed Rate : {machine.feed_rate || 0} Ton/h</p>
                  <p>Average Yeild : {machine.averageYield || 0}%</p>
                  <p>Production : {machine.totalProduction || 0} Ton/h</p>
                </div>
                <div className="mb-4">
                  <Title level={5} className="mb-3">
                    Status Control
                  </Title>
                  <Row gutter={16}>
                    {machine.working_status !== WORKING_STATUS.STARTED && (
                      <Col>
                        <Button
                          className="running"
                          type="primary"
                          onClick={() => {
                            setIsModalOpen(true);
                            handleStatusUpdate(
                              machine._id,
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

                    {machine.working_status === WORKING_STATUS.STARTED && (
                      <>
                        <Col>
                          <Button
                            className="hold"
                            onClick={() =>
                              handleStatusUpdate(
                                machine._id,
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
                                machine._id,
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
        title={editMachineData ? "Edit Kiln" : "Add New Kiln"}
        open={isMachineModalOpen}
        onCancel={() => {
          SetIsMachineModalOpen(false);
          setEditMachineData(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(data) => handleAddEditMachine(data, false)}
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
                    setEditMachineData(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  {editMachineData ? "Save Changes" : "Add Kiln"}
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
        <Row justify="space-between" align="middle">
          <Col>
            {feedRateEdit ? (
              <Input
                placeholder="Feed Rate"
                allowClear
                type="number"
                onChange={(e) => setFeedRate(e.target.value)}
              />
            ) : <>{machines?.map((item)=>item?.feed_rate)}</>}
          </Col>
          <Col>
            {feedRateEdit ? (
              <Button onClick={handleAddEditMachine}>Save</Button>
            ) : (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={handleFeedEdit}
              />
            )}
          </Col>
        </Row>

        <Table
          dataSource={machines[selectedMachineIndex]?.MachineMaterial?.map(
            (item, index) => ({
              id: item._id,
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
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      handleEditMaterial(records);
                    }}
                  />
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: "Are you sure you want to delete this material?",
                        content: `Material: ${records.name}`,
                        onOk() {
                          handleSaveMaterial(records, true);
                        },
                      });
                    }}
                  />
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
        <Form
          layout="vertical"
          form={form}
          onFinish={(data) => handleSaveMaterial(data, false)}
        >
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
