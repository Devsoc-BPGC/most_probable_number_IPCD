import React, { useEffect, useState } from 'react';
import { ChakraProvider, theme, Flex, Button, Text } from '@chakra-ui/react';
import Cell from '../Components/Cell';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  LineElement,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js';
import { useParams, useNavigate } from 'react-router-dom';
import SecCell from '../Components/SecCell';

ChartJS.register(
  Title,
  Tooltip,
  LineElement,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);
const Home = () => {
  const navigate = useNavigate();
  const { googleId } = useParams();
  const [user, setUser] = useState({});
  const [showGraph, setShowGraph] = useState(false);
  const [data, setData] = useState([]);
  const [copyData, setCopyData] = useState([]);
  const [mpnList, setMpn] = useState([]);
  const [gdata, setGdata] = useState({});
  const [exp, setExp] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:3001/user/${googleId}`)
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      });
  }, [googleId]);

  useEffect(() => {
    const x = {
      datasets: [
        {
          label: 'MPN vs Time',
          data: mpnList.map((item, i) => ({
            x: data[i]['time'].toISOString().slice(0, -5).split('T').join(' '),
            y: item,
            // item[0] === '≥' || item[0] === '≤'
            //   ? parseInt(item.slice(1))
            //   : parseInt(item),
          })),
          backgroundColor: 'yellow',
          borderColor: 'green',
          tension: 0.4,
          fill: true,
          pointStyle: 'rect',
          pointBorderColor: 'blue',
          pointBackgroundColor: '#fff',
          showLine: true,
        },
      ],
      options: {
        scales: {
          x: {
            type: 'time',
          },
        },
      },
    };
    setGdata(x);
  }, [showGraph]);

  return (
    <ChakraProvider theme={theme}>
      <Flex direction={'column'} overflowX={'hidden'}>
        <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          p={'1%'}
          borderBottom={'solid lightgray'}
        >
          <Text fontSize={'2xl'}>{`Welcome, ${user.name}`}</Text>
          <Flex justifyContent={'space-between'}>
            <Button
              colorScheme='blue'
              onClick={() => {
                exp === 1 ? setExp(2) : setExp(1);
              }}
              marginRight={'5%'}
            >
              {`Exp ${exp === 1 ? 2 : 1}`}
            </Button>
            <Button
              marginLeft={'5%'}
              colorScheme='blue'
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </Flex>
        </Flex>
        {/* {<Flex direction={'column'}>
          {copyData.map((item, i) => (
            <Cell
              key={i}
              setData={setData}
              form={item}
              completed={true}
              setMpn={setMpn}
              mpn={mpnList[i]}
            />
          ))}
          <Cell
            key={copyData.length}
            setData={setData}
            completed={false}
            setMpn={setMpn}
          />
          <Flex justifyContent={'end'}>
            {copyData.length <= 8 && !showGraph ? (
              <Button
                colorScheme='blue'
                m='1%'
                onClick={() => {
                  setCopyData(data);
                }}
              >
                +
              </Button>
            ) : (
              <></>
            )}
            <Button
              colorScheme='blue'
              m='1%'
              onClick={() => {
                console.log(data);
                setShowGraph(!showGraph);
              }}
            >
              End Exp
            </Button>
          </Flex>
          {showGraph ? (
            <Flex width={'70%'}>
              <Line data={gdata}>Hello</Line>
            </Flex>
          ) : (
            <></>
          )}
        </Flex>} */}
        {exp === 2 ? (
          <Flex direction={'column'}>
            <SecCell />
          </Flex>
        ) : (
          <Flex direction={'column'}>
            {copyData.map((item, i) => (
              <Cell
                key={i}
                setData={setData}
                form={item}
                completed={true}
                setMpn={setMpn}
                mpn={mpnList[i]}
              />
            ))}
            <Cell
              key={copyData.length}
              setData={setData}
              completed={false}
              setMpn={setMpn}
            />
            <Flex justifyContent={'end'}>
              {copyData.length <= 8 && !showGraph ? (
                <Button
                  colorScheme='blue'
                  m='1%'
                  onClick={() => {
                    setCopyData(data);
                  }}
                >
                  +
                </Button>
              ) : (
                <></>
              )}
              <Button
                colorScheme='blue'
                m='1%'
                onClick={() => {
                  console.log(data);
                  setShowGraph(!showGraph);
                }}
              >
                End Exp
              </Button>
            </Flex>
            {showGraph ? (
              <Flex width={'70%'}>
                <Line data={gdata}>Hello</Line>
              </Flex>
            ) : (
              <></>
            )}
          </Flex>
        )}
      </Flex>
    </ChakraProvider>
  );
};

export default Home;
