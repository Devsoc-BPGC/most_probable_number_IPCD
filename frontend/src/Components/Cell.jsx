import React, { useState, useEffect } from 'react';
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  Image,
  Text,
  RadioGroup,
  Radio,
} from '@chakra-ui/react';

const Cell = props => {
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [mpn, setMpn] = useState(null);
  const [metric, setMetric] = useState('hsv');
  const [form, setForm] = useState({
    constant: null,
    time: null,
    img: null,
  });
  const [isComp, setIsComp] = useState(props.completed);

  const handleSubmit = () => {
    setIsLoading(true);
    const fD = new FormData();
    fD.append('image', form.img);
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD,
    })
      .then(res => res.json())
      .then(data => {
        setForm(form => ({ ...form, img: data.imageUrl }));
        fetch('http://127.0.0.1:5000/img', {
          method: 'POST',
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({
            title: 'foo',
            body: 'bar',
            exptmode: 'standard',
            userId: user.googleId,
            img: data.imageUrl,
            metric: metric,
          }),
        })
          .then(res => res.text())
          .then(d => {
            d =
              form.constant *
              parseInt(
                d
                  .replace('greater than or equal to ', '') //≥
                  .replace('less than ', '') //≤
              );
            setMpn(d);
            props.setMpn(data => [...data, d]);
            fetch('http://localhost:3001/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                constant: form.constant,
                url: data.imageUrl,
                time: form.time,
                googleId: user.googleId,
                mpn: d,
              }),
            })
              .then(res => res.json())
              .then(data2 => {
                props.setData(d => [...d, { ...form, img: data.imageUrl }]);
                setIsComp(true);
              })
              .catch(err => console.log(err.message));
            setIsLoading(false);
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    if (props.completed) {
      setForm(props.form);
      setMpn(props.mpn);
    }
  }, [props]);

  return (
    <>
      <Flex>
        <Flex width='100%' direction={'column'} height={'-webkit-fit-content'}>
          <FormControl p={'2%'}>
            <FormLabel htmlFor='time'>Time</FormLabel>
            <Input
              disabled={isComp}
              id='time'
              placeholder='Select Date and Time'
              size='md'
              type='datetime-local'
              onChange={e => {
                const temp = new Date(e.target.value);
                setForm(form => ({ ...form, time: temp }));
              }}
            />
          </FormControl>
          <FormControl p={'2%'}>
            <FormLabel htmlFor='constant'>Constant</FormLabel>
            <Input
              disabled={isComp}
              id='constant'
              placeholder='Constant'
              size='md'
              type='number'
              onChange={e => {
                setForm(form => ({ ...form, constant: e.target.value }));
              }}
            />
          </FormControl>
          <FormControl p={'2%'}>
            <FormLabel htmlFor='image'>Image</FormLabel>
            <Input
              disabled={isComp}
              id='image'
              placeholder='Upload image'
              size='md'
              type='file'
              accept='image/*'
              onChange={e => {
                setForm(form => ({
                  ...form,
                  img: e.target.files[0],
                }));
              }}
            />
          </FormControl>
          <RadioGroup
            onChange={setMetric}
            value={metric}
            p={'2%'}
            isDisabled={isComp}
          >
            <Radio value={'hsv'} marginRight={'2%'}>
              HSV
            </Radio>
            <Radio value={'delta'}>Delta E</Radio>
          </RadioGroup>
          <Flex justifyContent={'end'} p='2%'>
            <Button
              isLoading={isLoading}
              disabled={isComp || !form.constant || !form.img || !form.time}
              colorScheme='blue'
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Flex>
        </Flex>
        <Divider
          orientation='vertical'
          borderWidth={'1.5px'}
          borderColor={'black'}
          height={'auto'}
        />
        <Flex width='100%' direction={'column'}>
          {!isComp || !form.constant || !form.img || !form.time ? (
            <></>
          ) : (
            <Flex
              p='5%'
              direction={'column'}
              alignItems={'center'}
              justifyContent={'space-around'}
              height={'100%'}
            >
              <Flex alignItems={'start'} width={'100%'}>
                <Image src={form.img} p='1%' boxSize={100} />
                <Flex direction={'column'} width={'100%'}>
                  <Text p='3%'>{`Time: ${form.time.toDateString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}</Text>
                  <Text p='3%'>{`Constant: ${form.constant}`}</Text>
                </Flex>
              </Flex>
              <Text fontSize={'6xl'}>{mpn}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Divider
        orientation='horizontal'
        borderWidth={'1.5px'}
        borderColor={'black'}
      />
    </>
  );
};

export default Cell;
