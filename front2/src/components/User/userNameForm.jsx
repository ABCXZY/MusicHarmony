import styled from "styled-components";
import {useState} from "react";
import {CreateRoom} from "../../pages/api/roomAPI";

const UserNameForm = () => {
    const [name, setName] = useState("");

    // var stompClient = null;
    // connnect(stompClient);
    // stompClient.send()

    const submitForm = (e) => {
        e.preventDefault();
        localStorage.setItem('userName', name);
        setName("");
    }

    return(
        <>
            <NameForm>
                <TextInput
                    type="text"
                    value={name}
                    placeholder={"이름을 적어주세요"}
                    onChange={e => {setName(e.target.value)}}
                ></TextInput>
                <SubmitBtn onClick={submitForm}> 이름 설정 !</SubmitBtn>
            </NameForm>
        </>
    );
}

const NameForm = styled.div`
  
`
const TextInput = styled.input`

`
const SubmitBtn = styled.button`
`

export default UserNameForm;