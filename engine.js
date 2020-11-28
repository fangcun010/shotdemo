const EPS=1e-5

function loadImage(src){
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

let audioContext=new AudioContext()

function playSound(buffer){
    const source=audioContext.createBufferSource()

    source.buffer=buffer
    source.connect(audioContext.destination)
    source.loop=false

    source.start(0)
}

function loadAudio(src){
    return new Promise((resolve,reject)=>{
        const request=new XMLHttpRequest()

        request.open('GET',src,true)
        request.responseType='arraybuffer'

        request.onload=function(){
            const audioData=request.response

            audioContext.decodeAudioData(audioData,function(buffer){
                resolve(buffer)
            },reject)
        }

        request.send()
    })
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function iDiv (a, b) {
    return (a - a % b) / b
}

function iMod (a, b) {
    return a % b
}


class PaintPage{
    constructor(options={}) {
        this._width=options.width??100
        this._height=options.height??100

        this._canvas=document.createElement('canvas')
        this._canvas.width=this._width
        this._canvas.height=this._height
    }

    drawPage(srcPage,sx=0,sy=0,sw=srcPage._width,sh=srcPage._height,
             dx=0,dy=0,dw=this._width,dh=this._height){
        const ctx=this._canvas.getContext('2d')

        ctx.drawImage(srcPage._canvas,sx,sy,sw,sh,dx,dy,dw,dh)
    }

    drawImage(srcImg,sx=0,sy=0,sw=this._width,sh=this._height,
              dx=0,dy=0,dw=srcImg._width,dh=srcImg._height){
        const ctx=this._canvas.getContext('2d')

        ctx.drawImage(srcImg,sx,sy,sw,sh,dx,dy,dw,dh)
    }

    clear(clearColor='white'){
        const ctx=this._canvas.getContext('2d')

        ctx.fillStyle=clearColor
        ctx.fillRect(0,0,this._canvas.width,this._canvas.height)
    }

    getCanvas(){
        return this._canvas
    }

    getWidth(){
        return this._width
    }

    getHeight(){
        return this._height
    }
}

class StateMachine{
    constructor(options={}) {
        this._currentState=options.currentState??0

        this._stateUpdateActions=new Map()
        this._transitionTable=new Map()
        this._eventBaseID=0
        this._stateBaseID=0
    }

    addTransition(sourceState,event,destState,action){
        const stateTransitionTable=this._transitionTable[sourceState]
        stateTransitionTable[event]={
            destState:destState,
            action:action
        }
    }

    transition(event){
        const stateTransitionTable=this._transitionTable[this._currentState]
        const transitionInfo=stateTransitionTable[event]

        if(transitionInfo===undefined){
            return
        }

        transitionInfo.action(this._currentState,event,transitionInfo.destState)
        this._currentState=transitionInfo._currentState=transitionInfo.destState
    }

    update(){
        const updateAction=this._stateUpdateActions[this._currentState]

        if(updateAction===undefined){
            return
        }

        updateAction(this._currentState)
    }

    setStateUpdateAction(state,action){
        this._stateUpdateActions[state]=action
    }

    setCurrentState(state){
        this._currentState=state
    }

    newEvent(){
        return this._eventBaseID++
    }

    newState(){
        const state=this._stateBaseID++
        this._transitionTable[state]=new Map()
        return state
    }

    getCurrentState(){
        return this._currentState
    }
}