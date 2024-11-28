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
  // Spin,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  // WarningOutlined,
  LineChartOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import API_ENDPOINTS from "../../Config/config";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const Machine = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKiln, setEditingKiln] = useState(null);
  const [kilns, setKilns] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currentKilnId, setCurrentKilnId] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false); 
  const [selectedQuantity,setSelectedQuantity]=useState()

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


  useEffect(() => {
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
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MATERIAL);
      console.log("OOO", response)
      setMaterials(response.data.result);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      message.error("Failed to fetch material data");
    }
  };
  const handleStatusUpdate = async (kilnId, status) => {
    try {
      const payload = {
        id: kilnId,
        working_status: status,
      };
      await axios.post(API_ENDPOINTS.MACHINE, payload);
      const kilnIndex = kilns.findIndex((kiln) => kiln.id === kilnId);
      const updatedKilns = [...kilns];
      updatedKilns[kilnIndex].working_status = status;  
      setKilns(updatedKilns);
  
      message.success(`Kiln status updated to ${status} successfully!`);
  
      if (status === WORKING_STATUS.STARTED) {
        setCurrentKilnId(kilnId);
        fetchMaterials();
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to update kiln status:", error);
      message.error("Failed to update kiln status");
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




  const handleSaveMaterial = async () => {
    try {
      if (!selectedMaterial || !selectedQuantity) {
        message.warning("Please select a material and enter the quantity.");
        return;
      }
      const payload = {
        material_id: selectedMaterial, 
        kiln_id: currentKilnId,       
        quantity: selectedQuantity,   
      };
      await axios.post(`${API_ENDPOINTS.MACHINE}/kiln-material`, payload);
      message.success("Material added successfully!");
      setIsAddMaterialModalOpen(false); 
      fetchMaterials(); 
    } catch (error) {
      console.error("Failed to add material:", error);
      message.error("Failed to add material");
    }
  };
  
  
  return (
    <div className="p-6 relative">
      <div style={{ marginBottom: "50px" }}>
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
              style={getCardStyle(kiln.working_status)}
              extra={
                <Row justify="space-between" align="middle" className="w-full">
                  <Col>
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
                  </Col>
                </Row>
              }
            >
              <div className="card">
                <LineChartOutlined className="text-lg" />
                <h3>{kiln.name}</h3>
            
              </div>

              <div className="mb-4">
              <h3 >
                  {kiln.working_status === WORKING_STATUS.NOT_STARTED
                    ? "Not Started"
                    : kiln.working_status === WORKING_STATUS.HOLD
                    ? " On Hold"
                    : kiln.working_status === WORKING_STATUS.STARTED
                    ? "Running"
                    : "Shut Down"}
                </h3>
                <div>Capacity: {kiln.capacity} (Ton/h)</div>
                Last updated: {new Date(kiln.updatedAt).toLocaleString()}
              </div>

              <div className="mb-4">
                <Title level={5} className="mb-3">
                  Status Control
                </Title>
                <Row gutter={16}>
                  <Col>
                    <Button
                      className="running"
                      type="primary"
                      onClick={() =>
                          handleStatusUpdate(kiln.id, WORKING_STATUS.STARTED)
                      }
                      icon={<PlayCircleOutlined />}
                    >
                      Start
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      className="hold"
                      onClick={() =>
                        handleStatusUpdate(kiln.id, WORKING_STATUS.HOLD)
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
                        handleStatusUpdate(kiln.id, WORKING_STATUS.SHUT_DOWN)
                      }
                    >
                      Shutdown
                    </Button>
                  </Col>
                </Row>
              </div>
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
            icon={<PlusOutlined />}
            onClick={() => setIsAddMaterialModalOpen(true)}
          >
            Add Material
          </Button>
        }
      >
        <Table
          dataSource={materials.map((material, index) => ({
            key: index,
            name: material.name,
          }))}
          columns={[
            {
              title: "Material Name",
              dataIndex: "name",
              key: "name",
            },
          ]}
          pagination={false}
        />
      </Modal>

      <Modal
  title="Add Material"
  open={isAddMaterialModalOpen}
  onCancel={() => setIsAddMaterialModalOpen(false)}
  onOk={handleSaveMaterial}
>
  <Form layout="vertical">
    <Form.Item
      label="Select Material"
      rules={[{ required: true, message: "Please select a material" }]}
    >
      <Select
        placeholder="Select a material"
        style={{ width: "100%" }}
        value={selectedMaterial}
        onChange={(value) => setSelectedMaterial(value)} // Update material ID
      >
        {materials.map((material) => (
          <Option key={material.id} value={material.id}>
            {material.name}
          </Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      label="Quantity"
      rules={[{ required: true, message: "Please enter a quantity" }]}
    >
      <Input
        type="number"
        placeholder="Enter quantity"
        value={selectedQuantity}
        onChange={(e) => setSelectedQuantity(Number(e.target.value))} // Update quantity
      />
    </Form.Item>
  </Form>
</Modal>


    </div>
  );
};

export default Machine;
