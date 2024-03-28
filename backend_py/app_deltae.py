from flask import Flask, jsonify, request, render_template,make_response,request,send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import datetime
import cv2
import os
import numpy as np
import json
import urllib
import colour


# creating a Flask app
app = Flask(__name__,static_folder='stylesheets')


upload_folder = os.path.join('static', 'uploads')
app.config['UPLOAD'] = upload_folder
cors = CORS(app, resources={r'/img': {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

    
@app.route('/img', methods = ['GET','POST'])
def prompt():
    if(request.method == 'GET'):
  
        data = "its up <GET>"
        #print("hxdhk")
        return "hi"
    
    if(request.method == 'POST'):
        data_json = json.loads(request.data)
        print(data_json)
        mode = data_json['exptmode']
        img_url = data_json['img']
        metric = data_json['metric']
        print(img_url)

        h_vals = []
        # Load the image
        #cropped_image = cv2.imread('/Users/harshvardhanmestha/Desktop/abc.png')
        url_response = urllib.request.urlopen(img_url)
        jpg_as_np = np.frombuffer(url_response.read(), dtype=np.uint8)
        print(len(jpg_as_np))
        cropped_image = cv2.imdecode(jpg_as_np,cv2.IMREAD_COLOR)
        print(cropped_image.shape)
        # cv2.imshow("yes",img)
        # cv2.waitKey()
        num_rows, num_cols = 4, 6

        cell_height = cropped_image.shape[0] // num_rows
        cell_width = cropped_image.shape[1] // num_cols

        circle_radius = 20

        average_colors = []

        for i in range(num_rows):
            for j in range(num_cols):
                # Calculate the center coordinates of the circular mask
                center_x = j * cell_width + cell_width // 2
                center_y = i * cell_height + cell_height // 2

                # Create a circular mask with the defined radius
                mask = np.zeros_like(cropped_image)
                cv2.circle(mask, (center_x, center_y), circle_radius, (255, 255, 255), -1)

                # Extract the region of interest (ROI) for the circular mask
                roi = cv2.bitwise_and(cropped_image, mask)
                
                ## converting bgr to rgb 
                #roi  = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB) 
                
                ## converting bgr to rgb 
                if metric == 'hsv':
                    roi  = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV) 
                if metric == 'delta':
                    roi  = cv2.cvtColor(roi, cv2.COLOR_BGR2Lab) 


                # Calculate the average RGB value of the circular area in the current beaker
                total_pixels = np.sum(mask[:, :, 0] > 0)
                if total_pixels > 0:
                    average_color = np.sum(roi, axis=(0, 1)) // total_pixels
                else:
                    average_color = np.array([0, 0, 0])  # Default black color if no valid pixels are found

                # Add the average RGB value to the list
                average_colors.append(average_color)
                h_vals.append(average_color[0])

                # Print the average RGB value of the liquid in the current beaker
                print(f'Beaker at row {i+1}, column {j+1} has average HSV color: {average_color}, H value: {average_color[0]}')

                # Draw circle around detected region
                cv2.circle(cropped_image, (center_x, center_y), circle_radius, (0, 255, 0), 2)

        # cv2.imshow('Detected Beakers', cropped_image)
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()
        ret, jpeg = cv2.imencode('.png', cropped_image)
        #response = make_response(jpeg.tobytes())
        time = datetime.datetime.now()
        cv2.imwrite(os.path.join('image_debug_logs' , f'img_{time}.png'), cropped_image)

        
        def distance(colora,colorb):
            delta_E = colour.delta_E(colora, colorb)
            if (delta_E <= 1):
                return True

                # <= 1.0	Not perceptible by human eyes.
                # 1 - 2	Perceptible through close observation.
                # 2 - 10	Perceptible at a glance.
                # 11 - 49	Colors are more similar than opposite
                # 100	Colors are exact opposite

            return False


        #return send_file('static/Image/img.png', mimetype='image/gif')
        final_str = ""
        ## logic for counting row-wise light/dark
        if(mode=="standard"):
            if metric == 'hsv':
                c1 = h_vals[0]
                c2 = h_vals[1]

                r1 = 0
                r2 = 0
                r3 = 0

                for i in range(0,len(h_vals)):
                    if(i>=6 and i<=10):
                        # if(c1-h_vals[i]>0):
                        if(h_vals[i]>(c2+7) or h_vals[i]<(c2-7)):
                            r1 = r1 + 1
                    if(i>=12 and i<=16):
                        # if(c2-h_vals[i]>0):
                        if(h_vals[i]>(c2+7) or h_vals[i]<(c2-7)):
                            r2 = r2 + 1
                    if(i>=18 and i<=22):
                        # if(c2-h_vals[i]>0):
                        if(h_vals[i]>(c2+7) or h_vals[i]<(c2-7)):
                            r3 = r3 + 1
                # print(r1, r2, r3)
            if metric == 'delta':
                lab_vals = average_colors

                c1 = lab_vals[0]
                c2 = lab_vals[1]

                r1 = 0
                r2 = 0
                r3 = 0

                for i in range(0,len(h_vals)):
                    if(i>=6 and i<=10):
                        if distance(lab_vals[i],c2):
                            r1 = r1 + 1
                    if(i>=12 and i<=16):
                        # if(c2-h_vals[i]>0):
                        if distance(lab_vals[i],c2):
                            r2 = r2 + 1
                    if(i>=18 and i<=22):
                        # if(c2-h_vals[i]>0):
                        if distance(lab_vals[i],c2):
                            r3 = r3 + 1




            ##mpn logic 

            mpn = 0

            if(r1==0 and r2==0 and r3==0):mpn = "less than " + str(2) ##less than 2
            elif(r1==0 and r2==0 and r3==1):mpn = 2
            elif(r1==0 and r2==1 and r3==0):mpn = 2
            elif(r1==0 and r2==2 and r3==0):mpn = 4
            ###
            elif(r1==1 and r2==0 and r3==0):mpn = 2
            elif(r1==1 and r2==0 and r3==1):mpn = 4
            elif(r1==1 and r2==1 and r3==0):mpn = 4
            elif(r1==1 and r2==1 and r3==1):mpn = 6
            elif(r1==1 and r2==2 and r3==0):mpn = 6
            ###
            elif(r1==2 and r2==0 and r3==0):mpn = 4
            elif(r1==2 and r2==0 and r3==1):mpn = 7
            elif(r1==2 and r2==1 and r3==0):mpn = 7
            elif(r1==2 and r2==1 and r3==1):mpn = 9
            elif(r1==2 and r2==2 and r3==0):mpn = 9
            elif(r1==2 and r2==3 and r3==0):mpn = 12
            ###
            elif(r1==3 and r2==0 and r3==0):mpn = 8
            elif(r1==3 and r2==0 and r3==1):mpn = 11
            elif(r1==3 and r2==1 and r3==0):mpn = 11
            elif(r1==3 and r2==1 and r3==1):mpn = 14
            elif(r1==3 and r2==2 and r3==0):mpn = 14
            elif(r1==3 and r2==2 and r3==1):mpn = 17
            ###
            elif(r1==4 and r2==0 and r3==0):mpn = 13
            elif(r1==4 and r2==0 and r3==1):mpn = 17
            elif(r1==4 and r2==1 and r3==0):mpn = 17
            elif(r1==4 and r2==1 and r3==1):mpn = 21 ## or 26 ??
            elif(r1==4 and r2==2 and r3==0):mpn = 22
            elif(r1==4 and r2==2 and r3==1):mpn = 26
            elif(r1==4 and r2==3 and r3==0):mpn = 27
            elif(r1==4 and r2==3 and r3==1):mpn = 33
            elif(r1==4 and r2==4 and r3==0):mpn = 34
            ###
            elif(r1==5 and r2==0 and r3==0):mpn = 23
            elif(r1==5 and r2==0 and r3==1):mpn = 30
            elif(r1==5 and r2==0 and r3==2):mpn = 40
            elif(r1==5 and r2==1 and r3==0):mpn = 30
            elif(r1==5 and r2==1 and r3==1):mpn = 50
            elif(r1==5 and r2==1 and r3==2):mpn = 60
            elif(r1==5 and r2==2 and r3==0):mpn = 50
            elif(r1==5 and r2==2 and r3==1):mpn = 70
            elif(r1==5 and r2==2 and r3==2):mpn = 90
            elif(r1==5 and r2==3 and r3==0):mpn = 80
            elif(r1==5 and r2==3 and r3==1):mpn = 110
            elif(r1==5 and r2==3 and r3==2):mpn = 140
            elif(r1==5 and r2==3 and r3==3):mpn = 170
            elif(r1==5 and r2==4 and r3==0):mpn = 130
            elif(r1==5 and r2==4 and r3==1):mpn = 170
            elif(r1==5 and r2==4 and r3==2):mpn = 220
            elif(r1==5 and r2==4 and r3==3):mpn = 280
            elif(r1==5 and r2==4 and r3==4):mpn = 350
            elif(r1==5 and r2==5 and r3==0):mpn = 240
            elif(r1==5 and r2==5 and r3==1):mpn = 300
            elif(r1==5 and r2==5 and r3==2):mpn = 500
            elif(r1==5 and r2==5 and r3==3):mpn = 900
            elif(r1==5 and r2==5 and r3==4):mpn = 1600
            elif(r1==5 and r2==5 and r3==5):mpn = "greater than or equal to " + str(1600)

            final_str = mpn
        
        elif(mode=="batch"):
            img_test0 = data_json['test0']
            img_test1 = data_json['test1']
            img_test2 = data_json['test2']
            img_test3 = data_json['test3']
            img_test4 = data_json['test4']

            links = [img_test0,img_test1,img_test2,img_test3,img_test4]
            tests = []
            test_h_vals = []
            lab_vals = []

            for link in links:
                url_response = urllib.request.urlopen(link)
                jpg_as_np = np.frombuffer(url_response.read(), dtype=np.uint8)
                print(len(jpg_as_np))
                test = cv2.imdecode(jpg_as_np,cv2.IMREAD_COLOR)
                tests.append(test)

            
            for test in tests:
                x = int(test.shape[0] / 2)
                y = int(test.shape[1] / 2)

                roi = test[x-20:x+20, y-20:y+20]

                if metric == 'hsv':
                    roi  = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV) 
                if metric == 'delta':
                    roi  = cv2.cvtColor(roi, cv2.COLOR_BGR2Lab) 

                total_pixels = np.sum(roi[:, :, 0] > 0)
                average_color = np.sum(roi, axis=(0, 1)) // total_pixels

                if metric == 'hsv':
                    test_h_vals.append(average_color[0]) 
                if metric == 'delta':
                    test_h_vals.append(average_color) 
                
                
                
                # print("tube"+str(i)+"hsv is"+str(average_color[0]))

            print(test_h_vals)
            c1 = h_vals[0]
            c2 = h_vals[3]
            c3 = h_vals[12]
            c4 = h_vals[15]

            b1 = 0;t1 = 0
            b2 = 0;t2 = 0
            b3 = 0;t3 = 0
            b4 = 0;t4 = 0

            tt0 = test_h_vals[0]
            tt1 = test_h_vals[1]
            tt2 = test_h_vals[2]
            tt3 = test_h_vals[3]
            tt4 = test_h_vals[4]

            if metric == 'hsv':
                
                for i in [1,2,6,7,8]:
                    if(c1-h_vals[i]>0):b1 = b1 + 1
                for i in [4,5,9,10,11]:
                    if(c2-h_vals[i]>0):b2 = b2 + 1
                for i in [13,14,18,19,20]:
                    if(c3-h_vals[i]>0):b3 = b3 + 1
                for i in [16,17,21,22,23]:
                    if(c4-h_vals[i]>0):b4 = b4 + 1

                if(tt0-tt1>0):t1=1
                if(tt0-tt2>0):t2=1
                if(tt0-tt3>0):t3=1
                if(tt0-tt4>0):t4=1

            if metric == 'delta':

                for i in [1,2,6,7,8]:
                    if distance(h_vals[i],c2):b1 = b1 + 1
                for i in [4,5,9,10,11]:
                    if distance(h_vals[i],c2):b2 = b2 + 1
                for i in [13,14,18,19,20]:
                    if distance(h_vals[i],c2):b3 = b3 + 1
                for i in [16,17,21,22,23]:
                    if distance(h_vals[i],c2):b4 = b4 + 1

                if distance(tt0,tt1):t1=1
                if distance(tt0,tt2):t2=1
                if distance(tt0,tt3):t3=1
                if distance(tt0,tt4):t4=1

            


            bs = [b1,b2,b3,b4]
            ts = [t1,t2,t3,t4]

            mpn_str = ""
            
            
            for i in range(0,4):
                b = bs[i]
                t = ts[i]

                if(t==0 and b==0):mpn = "less than " + str(1*(10**(2*i)))
                elif(t==0 and b==1):mpn = 1*(10**(2*i))
                elif(t==0 and b==2):mpn = 2*(10**(2*i))
                elif(t==0 and b==3):mpn = 4*(10**(2*i))
                elif(t==0 and b==4):mpn = 5*(10**(2*i))
                elif(t==0 and b==5):mpn = 7*(10**(2*i))
                elif(t==1 and b==0):mpn = 2*(10**(2*i))
                elif(t==1 and b==1):mpn = 3*(10**(2*i))
                elif(t==1 and b==2):mpn = 6*(10**(2*i))
                elif(t==1 and b==3):mpn = 9*(10**(2*i))
                elif(t==1 and b==4):mpn = 16*(10**(2*i))
                elif(t==1 and b==5):mpn = "greater than "+str(16*(10**(2*i)))

                if(i!=3):mpn_str = mpn_str + str(mpn) + ","
                else:mpn_str = mpn_str+ str(mpn)
                print("image"+str(i+1)+"processed")

                final_str  = mpn_str
                

        
        return str(final_str)

    

if __name__ == '__main__':
    app.run(debug = False)
