'use client'
import { getHeadMetadata } from '../../utils/SSRUtils'
import { Button, Container } from 'react-bootstrap'
import GoogleSignIn from '../GoogleSignIn/GoogleSignIn'
import { useState } from 'react'
import TradeCreate from '../TradeCreate/TradeCreate'
import TradeList from '../TradeList/TradeList'
import api from '../../api/ApiHelper'
import { v4 as generateUUID } from 'uuid'
import { useWasAlreadyLoggedIn } from '../../utils/Hooks'
import { getLoadingElement } from '../../utils/LoadingUtils'

export default function TradingOverview() {
    let [isLoggedIn, setIsLoggedIn] = useState(false)
    let [isCreateTradeOpen, setIsCreateTradeOpen] = useState(false)
    let [playerData, setPlayerData] = useState<AccountInfo>()
    let [tradeListKey, setTradeListKey] = useState(generateUUID())
    let wasAlreadyLoggedIn = useWasAlreadyLoggedIn()

    if (!isLoggedIn) {
        if (wasAlreadyLoggedIn) {
            return (
                <>
                    {getLoadingElement(<p>Logging in...</p>)}
                    <GoogleSignIn
                        key={'googleLogin'}
                        onAfterLogin={() => {
                            loadPlayerData().then(() => {
                                setIsLoggedIn(true)
                            })
                        }}
                    />
                </>
            )
        }
        return (
            <Container>
                <p>You need to be logged in, to use the trading feature.</p>
                <GoogleSignIn
                    key={'googleLogin'}
                    onAfterLogin={() => {
                        loadPlayerData().then(() => {
                            setIsLoggedIn(true)
                        })
                    }}
                />
            </Container>
        )
    }

    function loadPlayerData(): Promise<void> {
        return api.getAccountInfo().then(data => {
            setPlayerData(data)
        })
    }

    function onAfterTradeCreate() {
        setTradeListKey(generateUUID())
        setIsCreateTradeOpen(false)
    }

    return (
        <>
            <Container>
                {isCreateTradeOpen && playerData && playerData.mcId ? (
                    <TradeCreate
                        currentUserUUID={playerData.mcId}
                        onAfterTradeCreate={onAfterTradeCreate}
                        onWindowClose={() => {
                            setIsCreateTradeOpen(false)
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                        <Button
                            onClick={() => {
                                setIsCreateTradeOpen(true)
                            }}
                        >
                            Create Trade
                        </Button>
                    </div>
                )}
                <hr />
                <TradeList key={tradeListKey} currentUserUUID={playerData?.mcId} />
                <GoogleSignIn
                    key={'googleLogin'}
                    onAfterLogin={() => {
                        loadPlayerData().then(() => {
                            setIsLoggedIn(true)
                        })
                    }}
                />
            </Container>
        </>
    )
}

export const metadata = getHeadMetadata('Trading')
