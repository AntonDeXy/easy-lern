import React, { useState } from 'react'
import Header from './Components/Header'
import { MainSt } from './Components/Styled/Styled'
import Footer from './Components/Footer'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import ListsContainer from './Components/Lists'
import Words from './Components/Words'
import Modal from './Components/Modal'
import Menu from './Components/Menu'
import "antd/dist/antd.css"
import Notes from './Components/Notes'
import { useAuth0 } from "./react-auth0-spa"
import Profile from "./Components/Profile"
import PrivateRoute from './Components/PrivateRoute'
import { useEffect } from 'react'
import AddListUrl from './Components/AddListUrl'
import Spiner from './Components/Spiner'
import { connect } from 'react-redux'
import { setModal } from './redux/reducers/modal/modalReducer'
import { setUserThunk } from './redux/reducers/users/usersReducer'
import { getListsThunk } from './redux/reducers/lists/listsReducer'
import { getNotesThunk } from './redux/reducers/notes/notesReducer'
import HelpPage from './Components/Help'
import LoginForUse from './Components/LoginForUse'
import AdminPanel from './Components/AdminPanel/AdminPanel'
import { ThemeProvider } from 'styled-components'
import { LightTheme, DarkTheme } from './Components/Styled/Themes'

const App = ({modal, getNotes, currentList, setModal, currentPage, user, setUserThunk, getLists, ...props}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const { loading, userAuth0 } = useAuth0()
  const [menuStyle, setMenuStyle] = useState({animationName: 'menuAnimIn'})
  const [currentThemeName, setCurrentThemeName] = useState('light')
  const [currentTheme, setCurrentTheme] = useState()

  const menuToggle = () => {
    if (menuIsOpen) {
      setMenuStyle({animationName: 'menuAnimOut'})
      setTimeout(() => {
        setMenuIsOpen(!menuIsOpen)
      }, 500)
    } else {
      setMenuStyle({animationName: 'menuAnimIn'})
      setMenuIsOpen(!menuIsOpen)
    }
  }

  useEffect(() => {
    let tempCurrentTheme = {}
    switch (currentThemeName) {
      case 'light': {
        tempCurrentTheme = LightTheme
        break
      }
      case 'dark': {
        tempCurrentTheme = DarkTheme 
        break
      }
      default: tempCurrentTheme = LightTheme
    }
    setCurrentTheme(tempCurrentTheme)
  }, [currentThemeName])

  useEffect(() => {
    if (user.userId) {
      getLists(user.userId)
      getNotes(user.userId)
      setCurrentThemeName(user.theme ? user.theme : 'light')
    }
  }, [getLists, getNotes, user])

  useEffect(() => {
    if (!loading && userAuth0) {
      setUserThunk(userAuth0.sub, userAuth0.email, userAuth0.picture)
    }
  }, [loading, setUserThunk, userAuth0])


  if (loading) {
    document.title = 'Loading...'
    return (
      <Router>
        <Header />
        <MainSt>
          <Spiner />
        </MainSt>
        <Footer />
      </Router>
    )
  }

  return (
    <ThemeProvider theme={currentTheme} >
      <Router >
        <div className="App">
          <Header isMenuOpened={menuIsOpen} user={user} currentPage={currentPage} currentListName={currentList ? currentList?.name : ''} togglerMenu={() => menuToggle()} />
          {modal.isActive && (
            <Modal
              setModal={setModal}
            />
          )}
          {
            menuIsOpen && <Menu menuStyle={menuStyle} />
          }
          <MainSt>
            <Switch>

              <Route exact path='/' >
                <LoginForUse />
              </Route>

              <PrivateRoute
                path='/lists/add/:listId'
                render={(props) =>  <AddListUrl {...props} user={user} />}
              />

              <PrivateRoute path="/profile" component={Profile} />

              <PrivateRoute path="/lists">
                <ListsContainer />
              </PrivateRoute>

              <PrivateRoute path="/words">
                {currentList
                ? (
                    <Words
                      isLoading={loading}
                      user={user}
                      setModal={data => setModal(data)}
                    />
                  )
                  : <Redirect to='lists' /> 
                }
              </PrivateRoute>
              
              <Route exact path='/help'>
                <HelpPage />
              </Route>

              <PrivateRoute exact path='/notes'>
                <Notes />
              </PrivateRoute>

              <PrivateRoute exact path='/admin-panel'>
                {/* {
                  user?._id && user?.role === 'admin' */}
                  <AdminPanel user={user} />
                  {/* : <Redirect to='/' /> */}
                {/* } */}
              </PrivateRoute>
            </Switch>
          </MainSt>
          <Footer currentPage={currentPage} setModal={(data) => setModal(data)} />
        </div>
      </Router>
    </ThemeProvider>
  )
}

const mapStateToProps = state => ({
  listsState: state.listsReducer,
  modal: state.modalReducer,
  currentPage: state.mainReducer.currentPage,
  currentList: state.mainReducer.currentList,
  user: state.userReducer
})

const mapDispatchToProps = dispatch => ({
  getNotes: (userId) => dispatch(getNotesThunk(userId)),
  getLists: (userId) => dispatch(getListsThunk(userId)),
  setUserThunk: (id, email, userImg) => dispatch(setUserThunk(id, email, userImg)),
  setModal: (data) => dispatch(setModal(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
