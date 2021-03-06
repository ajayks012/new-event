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
import { pendingActionDetails, rejectedTableHeaders } from './tableHeader'
// import { reset_mygroupunassignAction } from '../../../redux/Actions/PendingAction'
import { routes, life } from '../../../util/Constants'
import {
  putClaimTaskAPI,
  getAllActiveUsersAPI,
  claimEventsCamunda,
  postFileAttachmentRangeResetAPI,
  getStatusEventCamundaAPINewWithFilter,
} from '../../../api/Fetch'
import LoadingComponent from '../../../components/LoadingComponent/LoadingComponent'
import { allMessages } from '../../../util//Messages'
import DialogHeader from '../../components/DialogHeader/DialogHeader'
import AutocompleteSelect from '../../components/AutoCompleteSelect/AutocompleteSelect'
import { reset_range_pendingAction } from '../../../redux/Actions/PendingAction/Action'

const Input = styled('input')({
  display: 'none',
})

function RcmMyTaskRejected(props: any) {
  const {
    // reset_mygroupunassignAction,
    eventPendingAction,
    userDetail,
    reset_range_pendingAction,
  } = props
  const { DEFAULT, DASHBOARD } = routes
  const theme = useTheme()
  const active = useMediaQuery(theme.breakpoints.down(700))
  const active1 = useMediaQuery(theme.breakpoints.between(370, 700))
  const classes = useStyles()
  const history = useHistory()
  const [globalFilter, setGlobalFilter] = useState('')
  const [unassignUser, setUnassignUser] = useState<any>([])
  const [checkCount, setCheckCount] = React.useState(1)
  const [failureCount, setFailureCount] = React.useState(0)
  const toast = useRef<any>(null)
  const [myPendingActions, setMyPendingActions] = useState([])
  //
  const [assigneeUsers, setAssigneeUsers] = useState([])
  const [userAssigned, setUserAssigned] = useState<any>()
  const [openAssignDialog, setOpenAssignDialog] = React.useState(false)
  const [isProgressLoader, setIsProgressLoader] = React.useState(false)
  const [uploadedFile, setUploadedFile] = useState<any>()
  const [comments, setComments] = useState('')
  //

  const goBack = () => {
    // reset_mygroupunassignAction()
    setUnassignUser([])
    reset_range_pendingAction()
    history.goBack()
  }
  // useEffect(() => {
  //   return () => {
  //     reset_range_pendingAction()
  //   }
  // }, [])

  // useEffect(() => {
  //   if (eventPendingAction && eventPendingAction[0].tasks != []) {
  //     console.log(
  //       eventPendingAction[0].tasks.filter(
  //         (item: any) => item.timeFilter === 'Missed'
  //       )
  //     )
  //     setMyPendingActions(
  //       eventPendingAction[0].tasks.filter(
  //         (item: any) => item.timeFilter === 'Missed'
  //       )
  //     )
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
      'myMissedTasks'
    )
      .then((res: any) => {
        console.log('filter response', res.data)
        let responseData = res.data.status
        let newData = responseData.filter(
          (task: any) => task.details === 'myMissedTasks'
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
                      <Typography variant="h6">
                        My Task {'>'} Missed or Over due
                      </Typography>
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
                      selection={unassignUser}
                      onSelectionChange={(e) => {
                        console.log(e.value)
                        setUnassignUser(e.value)
                      }}
                      scrollable
                      scrollHeight="flex"
                      globalFilter={globalFilter}
                      emptyMessage="No users found."
                      showGridlines
                      //loading={manageUserLoading}
                    >
                      {rejectedTableHeaders.map((column) => {
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
                  </Box>
                  {/* <Box
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
                      onClick={() => unassignUser && setOpenAssignDialog(true)}
                    >
                      Assign to Other
                    </Button>
                  </Box> */}
                </Grid>
              </Grid>
              <LoadingComponent showLoader={isProgressLoader} />
            </div>
          </div>
        </div>
      </div>
      {/* {assignToOtherDialog} */}
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
  }
}

// export default connect(mapStateToProps, matchDispatchToProps)(RcmPendingActions)
export default connect(mapStateToProps, matchDispatchToProps)(RcmMyTaskRejected)
