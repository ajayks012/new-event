import {
  Grid,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Button,
  styled,
  Dialog,
} from '@material-ui/core'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { teal } from '@material-ui/core/colors'
import { useStyles } from './Styles'
import { Toast } from 'primereact/toast'
import { pendingActionDetails, pendingActionTableHeaders } from './tableHeader'
// import { reset_mygroupunassignAction } from '../../../redux/Actions/PendingAction'
import { routes, life } from '../../../util/Constants'
import {
  putClaimTaskAPI,
  getAllActiveUsersAPI,
  claimEventsCamunda,
  postFileAttachmentRangeResetAPI,
  putCamundaMileStoneUpdate,
  getUsersAPIByRole,
  getUsersAPIByRolWithStatusA,
  getStatusEventCamundaAPINewWithFilter,
} from '../../../api/Fetch'
import LoadingComponent from '../../../components/LoadingComponent/LoadingComponent'
import { allMessages } from '../../../util//Messages'
import DialogHeader from '../../components/DialogHeader/DialogHeader'
import AutocompleteSelect from '../../components/AutoCompleteSelect/AutocompleteSelect'
import {
  reset_range_pendingAction,
  set_raf_pendingAction_CT06,
} from '../../../redux/Actions/PendingAction/Action'
import LightTooltip from '../../components/LightToolTip/LightTooltip'
import InfoIcon from '@material-ui/icons/Info'

const Input = styled('input')({
  display: 'none',
})

function RcmPendingActions(props: any) {
  const {
    // reset_mygroupunassignAction,
    eventPendingAction,
    userDetail,
    reset_range_pendingAction,
    set_raf_pendingAction_CT06,
  } = props
  const { DEFAULT, DASHBOARD, DASHBOARD_RAF_CT06 } = routes
  const theme = useTheme()
  const active = useMediaQuery(theme.breakpoints.down(700))
  const active1 = useMediaQuery(theme.breakpoints.between(370, 700))
  const classes = useStyles()
  const history = useHistory()
  const [globalFilter, setGlobalFilter] = useState('')
  // const [unassignUser, setUnassignUser] = useState<any>(null)
  const [assignToOther, setAssignToOther] = useState<any>([])
  const [checkCount, setCheckCount] = React.useState(1)
  const [failureCount, setFailureCount] = React.useState(0)
  const toast = useRef<any>(null)
  const [myPendingActions, setMyPendingActions] = useState([])
  //
  const [assigneeUsers, setAssigneeUsers] = useState([])
  const [userAssigned, setUserAssigned] = useState<any>()
  const [openAssignDialog, setOpenAssignDialog] = React.useState(false)
  const [isProgressLoader, setIsProgressLoader] = React.useState(false)
  const [roleNametoId, setRoleNametoId] = React.useState(false)
  const [uploadedFile, setUploadedFile] = useState<any>()
  const [comments, setComments] = useState('')
  //

  const goBack = () => {
    // reset_mygroupunassignAction()
    // setUnassignUser(null)
    setAssignToOther([])
    reset_range_pendingAction()
    history.goBack()
  }
  // useEffect(() => {
  //   return () => {
  //     reset_range_pendingAction()
  //     // setUnassignUser(null)
  //     setAssignToOther([])
  //   }
  // }, [])

  // useEffect(() => {
  //   if (eventPendingAction && eventPendingAction[0].tasks != []) {
  //     console.log(eventPendingAction[0].tasks)
  //     setMyPendingActions(eventPendingAction[0].tasks)
  //   } else {
  //     history.push(`${DEFAULT}${DASHBOARD}`)
  //   }
  // }, [])

  useEffect(() => {
    setIsProgressLoader(true)
    let userGroup =
      userDetail.userdetails &&
      userDetail.userdetails[0].usergroups[0].groupName.split('-')
    console.log(userGroup)
    let userGroup1 = userGroup[0].trim()
    console.log(userGroup1)
    getStatusEventCamundaAPINewWithFilter(
      userDetail &&
        userDetail.userdetails &&
        userDetail.userdetails[0].user.userId,
      userDetail &&
        userDetail.userdetails &&
        userDetail.userdetails[0].roles[0].roleName,
      userGroup1,
      'myPendingTasks'
    )
      .then((res: any) => {
        console.log('filter response', res.data)
        let responseData = res.data.status
        let newData = responseData.filter(
          (task: any) => task.details === 'myPendingTasks'
        )
        console.log('new response', newData)
        setMyPendingActions(newData[0].tasks)
        setIsProgressLoader(false)
      })
      .catch((err: any) => {
        console.log(err)
        setMyPendingActions([])
      })
  }, [])

  const handleSingleEvent = (data: any) => {
    if (data.taskName === 'CT06' || data.taskName === 'CT6') {
      console.log([data])
      set_raf_pendingAction_CT06(data)
      history.push(`${DEFAULT}${DASHBOARD_RAF_CT06}`)
      // setSelectedEvents([])
    } else {
      console.log([data])
      // set_raf_pendingAction_CT06(data)
      // history.push(`${DEFAULT}${DASHBOARD_RAF_CT06}`)
      // setSelectedEvents([])
    }
  }

  const eventNameTemplate = (rowData: any) => {
    return (
      <button
        value={rowData.eventName}
        //disabled={rowData.status.toLowerCase().includes('duplicate')}
        className={classes.greenButtons}
        onClick={() => handleSingleEvent(rowData)}
      >
        {rowData.eventName}
      </button>
    )
  }
  useEffect(() => {
    let roleId = 'RRMNGR'
    if (assignToOther.length > 0) {
      if (assignToOther[0].assigneeRole === 'Range Reset Manager') {
        roleId = 'RRMNGR'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Admin User') {
        roleId = 'ADMIN'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Buyer') {
        roleId = 'BUYER'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Buyer Assistant') {
        roleId = 'BYAST'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Category Director') {
        roleId = 'CTDIR'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Merchandiser') {
        roleId = 'MERCH'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Own Brand Manager') {
        roleId = 'OWNBRM'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Supplychain Specialist') {
        roleId = 'SCSPL'
        setRoleNametoId(true)
      } else if (assignToOther[0].assigneeRole === 'Sr. Buying Manager') {
        roleId = 'SRBYM'
        setRoleNametoId(true)
      } else {
        roleId = 'RRMNGR'
        setRoleNametoId(true)
      }
      if (roleNametoId === true) {
        //getUsersAPIByRole(roleId).then((res: any) => {
        getUsersAPIByRolWithStatusA(roleId).then((res: any) => {
          const userDetails = res.data.userdetails
            .filter(
              (val: any) =>
                userDetail.userdetails[0].user.userId !== val.user.userId
            )
            .map((val: any) => {
              return {
                email: val.user.emailId,
                label:
                  val.user.middleName && val.user.middleName !== ''
                    ? val.user.firstName +
                      val.user.middleName +
                      val.user.lastName
                    : val.user.firstName + ' ' + val.user.lastName,
                value: val.user.emailId,
                userId: val.user.userId,
                roles: val.roles.map((role: any) => {
                  return {
                    roleId: role.roleName,
                  }
                }),
              }
            })

          console.log(userDetails)
          setAssigneeUsers(userDetails)
        })
      }
    }
  }, [assignToOther, roleNametoId])

  // const claimPayload = userAssigned && {
  //   reviewDecision: 'AssignTask',
  //   requester: {
  //     persona: unassignUser.assigneeRole,
  //     details: {
  //       emailId: userDetail && userDetail.userdetails[0].user.emailId,
  //       userId: userDetail && userDetail.userdetails[0].user.userId,
  //       name:
  //         userDetail &&
  //         userDetail.userdetails[0].user.middleName &&
  //         userDetail.userdetails[0].user.middleName !== ''
  //           ? `${userDetail.userdetails[0].user.firstName} ${userDetail.userdetails[0].user.middleName} ${userDetail.userdetails[0].user.lastName}`
  //           : `${userDetail.userdetails[0].user.firstName} ${userDetail.userdetails[0].user.lastName}`,
  //     },
  //     roles:
  //       userDetail &&
  //       userDetail.userdetails[0].roles.map((role: any) => {
  //         return {
  //           // roleId: role.roleId,
  //           roleId: role.roleName,
  //         }
  //       }),
  //     usergroups:
  //       userDetail &&
  //       userDetail.userdetails[0].usergroups.map((group: any) => {
  //         return {
  //           groupId: group.groupId,
  //           status: group.status,
  //         }
  //       }),
  //   },
  //   eventStatus: 'Published',
  //   eventId: unassignUser.eventId,
  //   milestones: [
  //     {
  //       action: '',
  //       status: unassignUser.status,
  //       visibility: unassignUser.visibility,
  //       activeTaskId: unassignUser.activeTaskId,
  //       milestoneTaskId: unassignUser.milestoneTaskId,
  //       taskName: unassignUser.taskName,
  //       taskDescription: unassignUser.taskDescription,
  //       tradingGroup: unassignUser.tradingGroup,
  //       weeksPrior: unassignUser.weeksPrior,
  //       dueDate: unassignUser.dueDate,
  //       notifyDate: unassignUser.notifyDate,
  //       slaDate: unassignUser.slaDate,
  //       healthcheckDate: unassignUser.healthcheckDate,
  //       assigneeDetails: {
  //         emailId: userAssigned.email,
  //         userId: userAssigned.userId,
  //         name: userAssigned.label,
  //       },
  //       // assigneeRole: userAssigned.roles,
  //       assigneeRole: unassignUser.assigneeRole,
  //     },
  //   ],
  // }

  useEffect(() => {
    // console.log('Check count: ', checkCount)
    // console.log('Failure count: ', failureCount)
    console.log('going to useeffect')
    let detail
    let severity
    if (checkCount === 0) {
      if (failureCount === 0) {
        detail = allMessages.success.successAssign
        severity = 'success'
      } else if (failureCount > 0) {
        detail = `${failureCount} ${allMessages.error.errorAssign}`
        severity = 'error'
      }
      setAssignToOther([])
      setIsProgressLoader(false)
      toast.current.show([
        {
          severity: severity,
          summary: '',
          detail: detail,
          life: life,
          className: 'login-toast',
        },
      ])
      // setTimeout(() => history.push(`${DEFAULT}${DASHBOARD}`), life)
    }
  }, [checkCount, DASHBOARD, DEFAULT, history, failureCount])

  const handleAssignedUser = (e: any) => {
    if (e) {
      setUserAssigned(e)
      console.log(e)
    } else {
      setUserAssigned('')
    }
  }

  const handleAssignToOtherClose = () => {
    setOpenAssignDialog(false)
    setUserAssigned(null)
  }

  const handleAssignTask = () => {
    if (assignToOther.length > 0) {
      setOpenAssignDialog(false)
      setIsProgressLoader(true)
      // if (uploadedFile) {
      setFailureCount(assignToOther.length)
      setCheckCount(assignToOther.length)
      // referenceDocData.map((rf) => {
      for (let i = 0; i < assignToOther.length; i++) {
        if (uploadedFile) {
          const formdata1 = new FormData()
          formdata1.append('fileIn', uploadedFile)
          postFileAttachmentRangeResetAPI &&
            postFileAttachmentRangeResetAPI(formdata1, assignToOther[i].eventId)
              .then((res: any) => {
                const claimPayload = userAssigned && {
                  reviewDecision: 'AssignTask',
                  requester: {
                    persona: assignToOther[i].assigneeRole,
                    details: {
                      emailId:
                        userDetail && userDetail.userdetails[0].user.emailId,
                      userId:
                        userDetail && userDetail.userdetails[0].user.userId,
                      name:
                        userDetail &&
                        userDetail.userdetails[0].user.middleName &&
                        userDetail.userdetails[0].user.middleName !== ''
                          ? `${userDetail.userdetails[0].user.firstName} ${userDetail.userdetails[0].user.middleName} ${userDetail.userdetails[0].user.lastName}`
                          : `${userDetail.userdetails[0].user.firstName} ${userDetail.userdetails[0].user.lastName}`,
                    },
                    roles:
                      userDetail &&
                      userDetail.userdetails[0].roles.map((role: any) => {
                        return {
                          // roleId: role.roleId,
                          roleId: role.roleName,
                        }
                      }),
                    usergroups:
                      userDetail &&
                      userDetail.userdetails[0].usergroups.map((group: any) => {
                        return {
                          groupId: group.groupId,
                          status: group.status,
                        }
                      }),
                  },
                  eventStatus: 'Published',
                  eventId: assignToOther[i].eventId,
                  milestones: [
                    {
                      action: '',
                      status: assignToOther[i].status,
                      visibility: assignToOther[i].visibility,
                      activeTaskId: assignToOther[i].activeTaskId,
                      milestoneTaskId: assignToOther[i].milestoneTaskId,
                      taskName: assignToOther[i].taskName,
                      taskDescription: assignToOther[i].taskDescription,
                      tradingGroup: assignToOther[i].tradingGroup,
                      weeksPrior: assignToOther[i].weeksPrior,
                      dueDate: assignToOther[i].dueDate,
                      notifyDate: assignToOther[i].notifyDate,
                      slaDate: assignToOther[i].slaDate,
                      healthcheckDate: assignToOther[i].healthcheckDate,
                      assigneeDetails: {
                        emailId: userAssigned.email,
                        userId: userAssigned.userId,
                        name: userAssigned.label,
                      },
                      // assigneeRole: userAssigned.roles,
                      assigneeRole: assignToOther[i].assigneeRole,
                    },
                  ],
                  logging: {
                    comments: comments,
                    updated: res.data.attachmentUrl,
                    // updated: '',
                  },
                }
                putCamundaMileStoneUpdate(
                  assignToOther[i].eventId,
                  claimPayload
                )
                  .then((res1: any) => {
                    console.log(res1)
                    //setFailureCount((prevState) => prevState - 1)
                    setCheckCount((prevState) => prevState - 1)
                  })
                  .catch((err1: any) => {
                    console.log(err1)
                    //setFailureCount((prevState) => prevState - 1)
                    setCheckCount((prevState) => prevState - 1)
                  })
              })
              .catch((err: any) => {
                //setFailureCount((prevState) => prevState - 1)
                setCheckCount((prevState) => prevState - 1)
              })
        } else {
          const claimPayload = userAssigned && {
            reviewDecision: 'AssignTask',
            requester: {
              persona: assignToOther[i].assigneeRole,
              details: {
                emailId: userDetail && userDetail.userdetails[0].user.emailId,
                userId: userDetail && userDetail.userdetails[0].user.userId,
                name:
                  userDetail &&
                  userDetail.userdetails[0].user.middleName &&
                  userDetail.userdetails[0].user.middleName !== ''
                    ? `${userDetail.userdetails[0].user.firstName} ${userDetail.userdetails[0].user.middleName} ${userDetail.userdetails[0].user.lastName}`
                    : `${userDetail.userdetails[0].user.firstName} ${userDetail.userdetails[0].user.lastName}`,
              },
              roles:
                userDetail &&
                userDetail.userdetails[0].roles.map((role: any) => {
                  return {
                    // roleId: role.roleId,
                    roleId: role.roleName,
                  }
                }),
              usergroups:
                userDetail &&
                userDetail.userdetails[0].usergroups.map((group: any) => {
                  return {
                    groupId: group.groupId,
                    status: group.status,
                  }
                }),
            },
            eventStatus: 'Published',
            eventId: assignToOther[i].eventId,
            milestones: [
              {
                action: '',
                status: assignToOther[i].status,
                visibility: assignToOther[i].visibility,
                activeTaskId: assignToOther[i].activeTaskId,
                milestoneTaskId: assignToOther[i].milestoneTaskId,
                taskName: assignToOther[i].taskName,
                taskDescription: assignToOther[i].taskDescription,
                tradingGroup: assignToOther[i].tradingGroup,
                weeksPrior: assignToOther[i].weeksPrior,
                dueDate: assignToOther[i].dueDate,
                notifyDate: assignToOther[i].notifyDate,
                slaDate: assignToOther[i].slaDate,
                healthcheckDate: assignToOther[i].healthcheckDate,
                assigneeDetails: {
                  emailId: userAssigned.email,
                  userId: userAssigned.userId,
                  name: userAssigned.label,
                },
                // assigneeRole: userAssigned.roles,
                assigneeRole: assignToOther[i].assigneeRole,
              },
            ],
            logging: {
              comments: comments,
              //updated: res.data.attachmentUrl,
              updated: '',
            },
          }
          putCamundaMileStoneUpdate(assignToOther[i].eventId, claimPayload)
            .then((res1: any) => {
              console.log(res1)
              setFailureCount((prevState) => prevState - 1)
              setCheckCount((prevState) => prevState - 1)
            })
            .catch((err1: any) => {
              console.log(err1)
              //setFailureCount((prevState) => prevState - 1)
              setCheckCount((prevState) => prevState - 1)
            })
        }
      }
      // const formdata1 = new FormData()
      // // formdata1.append('fileIn', referenceDocData.data)
      // formdata1.append('fileIn', uploadedFile)
      // // formdata1.append('fileIn', rf.data)
      // postFileAttachmentRangeResetAPI &&
      //   postFileAttachmentRangeResetAPI(formdata1, unassignUser.eventId)
      //     .then((res: any) => {
      //       console.log(res.data)
      //       const claimPayloadchange = {
      //         ...claimPayload,
      //         logging: {
      //           comments: comments,
      //           updated: res.data.attachmentUrl,
      //           // updated: '',
      //         },
      //       }
      //       putCamundaMileStoneUpdate(
      //         unassignUser.eventId,
      //         claimPayloadchange
      //       )
      //         .then((res: any) => {
      //           console.log(res.data)
      //           setIsProgressLoader(false)
      //           toast.current.show({
      //             severity: 'success',
      //             summary: 'Success',
      //             // detail: res.data.comments,
      //             detail: 'Task assigned successfully',
      //             life: life,
      //             className: 'login-toast',
      //           })
      //         })
      //         .catch((err: any) => {
      //           console.log(err)
      //           setIsProgressLoader(false)
      //           toast.current.show({
      //             severity: 'error',
      //             summary: 'Error!',
      //             // detail: err.response.data.errorMessage
      //             //   ? err.response.data.errorMessage
      //             //   : '',
      //             detail: 'Task assigned failed.Please try again later',
      //             life: life,
      //             className: 'login-toast',
      //           })
      //         })
      //     })
      //     .catch((err: any) => {
      //       console.log(err)
      //       toast.current.show({
      //         severity: 'error',
      //         summary: 'Error!',
      //         //detail: `${err.response.status} from tasklistapi`,
      //         detail: 'Error in uploading file.Please Try later',
      //         life: life,
      //         className: 'login-toast',
      //       })
      //     })
      // // })
      // }
      // else {
      //   const claimPayloadchange = {
      //     ...claimPayload,
      //     logging: {
      //       comments: comments,
      //       //updated: res.data.attachmentUrl,
      //       updated: '',
      //     },
      //   }
      //   putCamundaMileStoneUpdate(unassignUser.eventId, claimPayloadchange)
      //     .then((res: any) => {
      //       console.log(res.data)
      //       setIsProgressLoader(false)
      //       toast.current.show({
      //         severity: 'success',
      //         summary: 'Success',
      //         // detail: res.data.comments,
      //         detail: 'Task assigned successfully',
      //         life: life,
      //         className: 'login-toast',
      //       })
      //     })
      //     .catch((err: any) => {
      //       console.log(err)
      //       setIsProgressLoader(false)
      //       toast.current.show({
      //         severity: 'error',
      //         summary: 'Error!',
      //         //detail: `${err.response.status} from tasklistapi`,
      //         // detail: err.response.data.errorMessage
      //         //   ? err.response.data.errorMessage
      //         //   : '',
      //         detail: 'Task assigned failed.Please try again later',
      //         life: life,
      //         className: 'login-toast',
      //       })
      //     })
      // }
    }
  }

  const handleFileUpload = (event: any) => {
    console.log(event.target.files[0])
    setUploadedFile(event.target.files[0])
  }

  const assignToOtherDialog = (
    <Dialog
      open={openAssignDialog}
      onClose={handleAssignToOtherClose}
      fullWidth
      classes={{
        paperFullWidth: classes.placeholderDialog,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // width: small ? "600px" : "260px",
          // height: "250px",
          // border: '3px solid green',
          borderRadius: 5,
          padding: '10px',
        }}
      >
        <DialogHeader
          title="Assign to Other"
          onClose={handleAssignToOtherClose}
        />
        {/* <Box sx={{ p: 3 }}> */}
        <Grid container spacing={2} style={{ padding: '10px' }}>
          <Grid item xs={12}>
            {/* <div> */}
            <Typography variant="body2" color="primary">
              Select User
              <LightTooltip
                title={
                  <>
                    <Typography color="secondary" variant="body2">
                      If the user is not in the list,please raise a request for
                      onbording in "User Management App"
                    </Typography>
                  </>
                }
                position={'top'}
                icon={
                  <InfoIcon
                    color="secondary"
                    fontSize="small"
                    style={{ padding: '3px' }}
                  />
                }
              />
            </Typography>
            <AutocompleteSelect
              value={userAssigned}
              options={assigneeUsers}
              onChange={handleAssignedUser}
              placeholder="Select User"
              // ref={focusResetType}
            />

            {/* </div> */}
          </Grid>
          <Grid item xs={12}>
            {/* <div> */}
            <Typography variant="body2" color="primary">
              Upload Reference Document
              <br />
              {/* </div> */}
              {/* <div> */}
              <input
                type="text"
                value={uploadedFile ? uploadedFile.name : ''}
                onClick={() => document.getElementById('selectedFile')!.click()}
                className={classes.uploadTextfield}
                placeholder="No file selected"
                readOnly
              />
              <Input
                type="file"
                id="selectedFile"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileUpload}
                required
              />
              <button
                type="button"
                onClick={() => document.getElementById('selectedFile')!.click()}
                className={classes.uploadButton}
              >
                Browse...
              </button>
            </Typography>
            {/* </div> */}
          </Grid>
          <Grid item xs={12}>
            {/* <div> */}
            <Typography variant="body2" color="primary">
              Comments
              <br />
              <textarea
                rows={5}
                className={classes.comments}
                value={comments}
                onChange={(e: any) => setComments(e.target.value)}
              />
            </Typography>
            {/* </div> */}
          </Grid>
          <Grid
            item
            xs={12}
            style={{
              textAlign: 'right',
            }}
          >
            <Button
              // type="submit"
              variant="contained"
              color="primary"
              className={classes.dialogButton}
              disabled={!userAssigned}
              onClick={handleAssignTask}
            >
              Assign
            </Button>
          </Grid>
        </Grid>
        {/* </Box> */}
      </Box>
    </Dialog>
  )

  return (
    <>
      <Toast
        ref={toast}
        position="bottom-left"
        onRemove={() => {
          history.push(`${DEFAULT}${DASHBOARD}`)
        }}
      />
      <div className="manageUser">
        <div className="manageRequest">
          <div className={classes.root}>
            <div className={classes.value}>
              <Grid container className={classes.container}>
                <Grid item sm={12} xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: active ? 'column' : 'row',
                      justifyContent: 'space-between',
                      p: 2,
                      width: '100%',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexGrow: 1,
                      }}
                    >
                      <Typography variant="h6">My Task {'>'} Total</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: active
                          ? active1
                            ? 'row'
                            : 'column'
                          : 'row',
                        alignItems: 'start',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                        }}
                      >
                        <input
                          type="text"
                          value={globalFilter}
                          onChange={(e) => setGlobalFilter(e.target.value)}
                          placeholder={' Search details here '}
                          style={{
                            width: '200px',
                          }}
                        />
                      </Box>
                      <Box
                        // sx={{
                        //   paddingLeft: 20,
                        // }}
                        sx={{
                          paddingLeft: !active ? 20 : 0,
                          paddingTop: active && !active1 && '10px',
                          width: '100%',
                          textAlign: active1 ? 'end' : 'start',
                        }}
                      >
                        <button
                          //className={classes.backButton}
                          className="backButton"
                          onClick={goBack}
                          type="button"
                        >
                          <svg
                            className="MuiSvgIcon-root"
                            focusable="false"
                            viewBox="0 0 34 34"
                            aria-hidden="true"
                          >
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
                          </svg>
                          Back
                        </button>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    {/* {!active ? ( */}
                    <DataTable
                      value={myPendingActions}
                      rowHover
                      paginator
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                      currentPageReportTemplate="{first} - {last} of {totalRecords}"
                      stateStorage="session"
                      stateKey="dt-state-demo-session-unassignworkflow"
                      rows={10}
                      style={{
                        width: '100%',
                      }}
                      selection={assignToOther}
                      onSelectionChange={(e) => {
                        console.log(e.value)
                        setAssignToOther(e.value)
                      }}
                      scrollable
                      scrollHeight="flex"
                      globalFilter={globalFilter}
                      emptyMessage="No users found."
                      showGridlines
                      //loading={manageUserLoading}
                    >
                      <Column
                        selectionMode="multiple"
                        headerStyle={{
                          width: '3em',
                          backgroundColor: teal[900],
                          color: 'white',
                        }}
                      ></Column>
                      {pendingActionTableHeaders.map((column) => {
                        return (
                          <Column
                            key={column.field}
                            field={column.field}
                            header={column.headerName}
                            bodyStyle={{
                              fontSize: '12px',
                              width: column.width,
                              overflowX: 'auto',
                            }}
                            headerStyle={{
                              fontSize: '12px',
                              width: column.width,
                              backgroundColor: teal[900],
                              color: 'white',
                            }}
                            body={
                              column.field === 'eventName' && eventNameTemplate
                            }
                            sortable
                          />
                        )
                      })}
                    </DataTable>
                    {/* ) : (
                    <DataTable
                      value={myPendingActions}
                      rowHover
                      paginator
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                      currentPageReportTemplate="{first} - {last} of {totalRecords}"
                      stateStorage="session"
                      stateKey="dt-state-demo-session"
                      rows={10}
                      style={{
                        width: '100%',
                      }}
                      selection={unassignUser}
                      onSelectionChange={(e) => setUnassignUser(e.value)}
                      scrollable
                      scrollHeight="flex"
                      globalFilter={globalFilter}
                      emptyMessage="No users found."
                      showGridlines
                      //loading={manageUserLoading}
                    >
                      <Column
                        selectionMode="multiple"
                        headerStyle={{
                          width: '3em',
                          backgroundColor: teal[900],
                          color: 'white',
                        }}
                      ></Column>
                      {pendingActionTableHeaders.map((column) => {
                        return (
                          <Column
                            key={column.field}
                            field={column.field}
                            header={column.headerName}
                            bodyStyle={{
                              fontSize: '12px',
                              width: column.width,
                              overflowX: 'auto',
                            }}
                            headerStyle={{
                              fontSize: '12px',
                              width: column.width,
                              backgroundColor: teal[900],
                              color: 'white',
                            }}
                            // body={
                            //   column.field === 'requestedId' && requestIdTemplate
                            // }
                            sortable
                          />
                        )
                      })}
                    </DataTable>
                  )} */}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'right',
                      p: 2,
                      width: '100%',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      // type="submit"
                      // size="small"
                      // onClick={handleAssign}
                      onClick={() =>
                        assignToOther.length > 0 && setOpenAssignDialog(true)
                      }
                    >
                      Assign to Other
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <LoadingComponent showLoader={isProgressLoader} />
            </div>
          </div>
        </div>
      </div>
      {assignToOtherDialog}
    </>
  )
}
const mapStateToProps = (state: any) => {
  return {
    eventPendingAction: state.pendingActionReducer.eventPendingAction,
    userDetail: state.loginReducer.userDetail,
  }
}
const matchDispatchToProps = (dispatch: any) => {
  return {
    reset_range_pendingAction: () => dispatch(reset_range_pendingAction()),
    set_raf_pendingAction_CT06: (rafTaskCT06: any) =>
      dispatch(set_raf_pendingAction_CT06(rafTaskCT06)),
  }
}

// export default connect(mapStateToProps, matchDispatchToProps)(RcmPendingActions)
export default connect(mapStateToProps, matchDispatchToProps)(RcmPendingActions)
