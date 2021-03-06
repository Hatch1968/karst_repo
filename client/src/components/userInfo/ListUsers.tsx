import React, {Component, useState, Fragment} from 'react';
import {UserInterface} from '../../interfaces/UserInterface';
import {parsePhoneNumberFromString, PhoneNumber} from 'libphonenumber-js';
import {
  getAllUsers,
  updateOneUserByID,
  deleteOneUserByID,
} from '../../dataservice/authentication';
import {Helmet} from 'react-helmet';
import {
  List,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Divider,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  StopOutlined,
  PlusCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import {AdvancedUserSearch} from './AdvancedUserSerach';
import {userContext, UserContextInterface} from '../../context/userContext';

const {Paragraph} = Typography;

const deleteUserFromSreen = (user: UserInterface, that: any) => {
  const listData = [...that.state.listData] as UserInterface[];
  let userIndex = listData.findIndex(u => user._id === u._id);
  listData.splice(userIndex, 1);

  const userList = [...that.state.listData] as UserInterface[];
  userIndex = userList.findIndex(u => user._id === u._id);
  userList.splice(userIndex, 1);
  that.setState({listData, userList});
};

const updateOneUserOnScreen = (
  user: UserInterface,
  that: Component<Props, State>
) => {
  const listData = [...that.state.listData] as UserInterface[];
  const userIndex = listData.findIndex(u => user._id === u._id);
  listData[userIndex] = user;
  that.setState({listData});
};

const UserToolbar = (user: UserInterface, that: Component<Props, State>) => {
  const buttons = [];
  const approveButton = (
    <Tooltip title="Approve user!">
      <CheckCircleOutlined
        style={{color: 'green'}}
        onClick={() => {
          user.status = 'Approved';
          updateOneUserByID(user._id, user).then(() => {
            message.success(user.firstName + ' has been approved!');
            updateOneUserOnScreen(user, that);
          });
        }}
      >
        Approve
      </CheckCircleOutlined>
    </Tooltip>
  );
  const deleteButton = (
    <Popconfirm
      title={
        'Are you sure you want to permanently delete ' +
        user.firstName +
        "'s account?"
      }
      okText="Delete"
      okButtonProps={{danger: true}}
      onConfirm={() => {
        deleteOneUserByID(user._id).then(() => {
          message.error(user.firstName + ' account has been deleted!');
          deleteUserFromSreen(user, that);
        });
      }}
    >
      <Tooltip title="Delete user!">
        <DeleteOutlined style={{color: 'red'}} />
      </Tooltip>
    </Popconfirm>
  );
  const rejectButton = (
    <Popconfirm
      title={
        <div>
          <Paragraph>
            Are you sure you want to reject {user.firstName}'s membership
            request?
          </Paragraph>
          <Paragraph>This will delete their account.</Paragraph>
        </div>
      }
      okText="Reject"
      okButtonProps={{danger: true}}
      onConfirm={() => {
        deleteOneUserByID(user._id).then(() => {
          message.error(user.firstName + ' has been rejected!');
          deleteUserFromSreen(user, that);
        });
      }}
    >
      <Tooltip title="Reject user!">
        <CloseCircleOutlined style={{color: 'red'}} />
      </Tooltip>
    </Popconfirm>
  );
  const pendingButton = (
    <Popconfirm
      title={
        'Are you sure you want to disable ' + user.firstName + "'s account?"
      }
      okText="Disable"
      okButtonProps={{danger: true}}
      onConfirm={() => {
        user.status = 'Pending';
        updateOneUserByID(user._id, user).then(() => {
          message.warning(user.firstName + ' has been disabled!');
          updateOneUserOnScreen(user, that);
        });
      }}
    >
      <Tooltip title="Disable Account">
        <StopOutlined />
      </Tooltip>
    </Popconfirm>
  );
  const makeAdminButton = (
    <Popconfirm
      title={'Are you sure you want to make ' + user.firstName + ' an admin?'}
      okText="Make Admin"
      onConfirm={() => {
        user.role = 'Admin';
        updateOneUserByID(user._id, user).then(() => {
          message.success(user.firstName + ' is now an admin!');
          updateOneUserOnScreen(user, that);
        });
      }}
    >
      <Tooltip title="Make admin!">
        <PlusCircleOutlined style={{color: 'green'}} />
      </Tooltip>
    </Popconfirm>
  );

  const makeUserButton = (
    <Popconfirm
      title={
        'Are you sure you want revoke ' +
        user.firstName +
        "'s admin privileges?"
      }
      okText="Make User"
      onConfirm={() => {
        user.role = 'User';
        updateOneUserByID(user._id, user).then(() => {
          message.success(user.firstName + ' is now a user!');
          updateOneUserOnScreen(user, that);
        });
      }}
    >
      <Tooltip title="Make user!">
        <MinusCircleOutlined style={{color: 'red'}} />
      </Tooltip>
    </Popconfirm>
  );
  switch (user.status) {
    case 'Approved':
      buttons.push(pendingButton, deleteButton);
      if (user.role === 'User') {
        buttons.push(makeAdminButton);
      } else if (user.role === 'Admin') {
        buttons.push(makeUserButton);
      }
      break;
    case 'Pending':
      buttons.push(approveButton, rejectButton);
      break;
    case 'Rejected':
      buttons.push(approveButton, pendingButton);
      break;
    default:
      break;
  }
  return buttons;
};

const formatPhoneNumber = (phoneNumber: string) => {
  let phone = "";

  try{
    phone = parsePhoneNumberFromString(phoneNumber).formatNational();
  }
  catch{
    phone = phoneNumber;
  }
  return phone;
};

interface UserStatusTagProps {
  status: string;
}
export const UserStatusTag: React.FunctionComponent<UserStatusTagProps> = props => {
  if (props.status === 'Pending') {
    return <Tag color="geekblue">{props.status}</Tag>;
  } else if (props.status === 'Approved') {
    return <Tag color="green">{props.status}</Tag>;
  } else if (props.status === 'Rejected') {
    return <Tag color="volcano">{props.status}</Tag>;
  } else {
    return <Tag>{props.status}</Tag>;
  }
};

export const UserRoleTag: React.FunctionComponent<{role: string}> = props => {
  if (props.role === 'Admin') {
    return <Tag color="green">{props.role}</Tag>;
  } else if (props.role === 'User') {
    return <Tag color="default">{props.role}</Tag>;
  } else {
    return null;
  }
};

// helper functinos
const DescriptionItem = ({title, content}) => (
  <Row>
    <Space>
      <Col>
        <h4>{title + ''}</h4>
        <Paragraph ellipsis={{rows: 2, expandable: true}}>{content}</Paragraph>
      </Col>
    </Space>
  </Row>
);

// End helper functions

interface State {
  userList: UserInterface[];
  listData: UserInterface[];
  loading: boolean;
}

interface Props {}

class ListUsers extends Component<Props, State> {
  constructor(Props) {
    super(Props);
    this.state = {
      userList: [],
      listData: [],
      loading: true,
    };
    this.renderAddress = this.renderAddress.bind(this);
  }
  componentDidMount() {
    getAllUsers().then(requestedUsers => {
      this.setState({
        userList: requestedUsers,
        listData: requestedUsers,
        loading: false,
      });
    });
  }

  renderAddress(user: UserInterface) {
    const currentUser = this.context as UserContextInterface;

    const allPrivate =
      user.privateFields.address &&
      user.privateFields.city &&
      user.privateFields.state &&
      currentUser.user.role !== 'Admin';

    const {address, city, state, zipCode, privateFields} = user;
    let addressString = '';
    if (currentUser.user.role === 'Admin' || !privateFields.city) {
      addressString += city;
    }
    if (currentUser.user.role === 'Admin' || !privateFields.state) {
      addressString += ' ' + state;
    }
    if (currentUser.user.role === 'Admin' || !privateFields.zipCode) {
      addressString += ' ' + zipCode;
    }
    return (
      <div>
        {!allPrivate && (
          <Fragment>
            <h4>Address</h4>
            <Row>
              <Col>
                {(currentUser.user.role === 'Admin' ||
                  !privateFields.address) && <p>{address}</p>}
                <p>{addressString}</p>
              </Col>
            </Row>
          </Fragment>
        )}
      </div>
    );
  }

  render() {
    const currentUser = this.context as UserContextInterface;
    return (
      <div>
        <Helmet>
          <title>Manage Users</title>
        </Helmet>
        <Card>
          <AdvancedUserSearch
            userList={this.state.userList}
            onSearch={results => {
              this.setState({listData: results});
            }}
          ></AdvancedUserSearch>
          <Divider></Divider>
          <List
            pagination={{
              onChange: page => {},
              pageSize: 8,
              position: 'bottom',
            }}
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 5,
              xxl: 6,
            }}
            dataSource={this.state.listData}
            renderItem={user => (
              <List.Item>
                <Card
                  title={
                    <Row>
                      <Col span={24}>
                        {user.firstName + ' ' + user.lastName}
                      </Col>
                      <Col span={24}>
                        <UserRoleTag role={user.role}></UserRoleTag>
                      </Col>
                    </Row>
                  }
                  actions={
                    this.context.user.role === 'Admin'
                      ? UserToolbar(user, this)
                      : null
                  }
                  loading={this.state.loading}
                >
                  <Row>
                    <Col span={24}>
                      <DescriptionItem
                        title="NSS Number"
                        content={user.nssNumber}
                      />
                    </Col>
                  </Row>
                  {(currentUser.user.role === 'Admin' ||
                    !user.privateFields.email) && (
                    <Row>
                      <Col span={24}>
                        <DescriptionItem
                          title="Email"
                          content={
                            <a href={'mailto:' + user.email}>{user.email}</a>
                          }
                        />
                      </Col>
                    </Row>
                  )}
                  {(currentUser.user.role === 'Admin' ||
                    !user.privateFields.phoneNumber) && (
                    <Row>
                      <Col span={24}>
                        <DescriptionItem
                          title="Phone Number"
                          content={
                            <a href={'tel:' + user.phoneNumber}>
                              {formatPhoneNumber(user.phoneNumber)}
                            </a>
                          }
                        />
                      </Col>
                    </Row>
                  )}
                  <Row>
                    <Col span={24}>{this.renderAddress(user)}</Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <DescriptionItem
                        title="Status"
                        content={
                          <UserStatusTag status={user.status}></UserStatusTag>
                        }
                      ></DescriptionItem>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </div>
    );
  }
}

ListUsers.contextType = userContext;

export {ListUsers};
