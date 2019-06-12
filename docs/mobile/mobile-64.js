var BAP = (function() {
                        var API = {},
                          SCRIPT_VERSION = 1, // increment this on script changes so we can track through the sewer
                          /* NON_PROD */
                          logging = true /* NON_PROD */,
                          detection = "on",
                          sizes = [{ i: 1, w: 300, h: 250, m: 0 }, { i: 15, w: 728, h: 90, m: 0 }, { i: 30, w: 300, h: 50, m: 1 }, { i: 53, w: 320, h: 50, m: 1 }, { i: 55, w: 216, h: 36, m: 1 }, { i: 16, w: 160, h: 600, m: 1 }, { i: 57, w: 120, h: 20, m: 1 }, { i: 17, w: 120, h: 600, m: 1 }, { i: 8, w: 468, h: 60, m: 1 }, { i: 9, w: 234, h: 60, m: 0 }, { i: 80, w: 320, h: 48, m: 1 }, { i: 141, w: 480, h: 75, m: 1 }, { i: 199, w: 480, h: 320, m: 0 }, { i: 200, w: 320, h: 480, m: 0 }, { i: 201, w: 1048, h: 768, m: 0 }, { i: 202, w: 768, h: 1048, m: 0 }, { i: 213, w: 320, h: 350, m: 0 }, { i: 212, w: 320, h: 320, m: 0 }, { i: 211, w: 120, h: 30, m: 1 }, { i: 210, w: 168, h: 42, m: 1 }, { i: 56, w: 168, h: 28, m: 1 }, { i: 208, w: 300, h: 75, m: 1 }, { i: 209, w: 216, h: 54, m: 1 }, { i: 215, w: 100, h: 640, m: 1 }, { i: 152, w: 300, h: 160, m: 1 }, { i: 216, w: 540, h: 338, m: 0 }, { i: 217, w: 600, h: 100, m: 1 }, { i: 218, w: 600, h: 500, m: 0 }, { i: 219, w: 340, h: 496, m: 0 }, { i: 220, w: 1024, h: 768, m: 0 }, { i: 221, w: 768, h: 1024, m: 0 }, { i: 222, w: 260, h: 60, m: 1 }, { i: 223, w: 240, h: 38, m: 1 }, { i: 1, w: 300, h: 600, m: 0 }],
                          b64i = { "mi_12_top-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcxJREFUeNpi/P///9rSk3cM9n/4LuQkzPsmV0PitiwPx3cGwuA3C5Bgu/HlJ//trz/5eJmZGC6++fxBipv9JTMj438CmpmYQOTp7785uZiZ/itxs30pvvpEK+noLeMTLz8KEtD8H6yZnYnxvww7y/cJxopXNlmpnvn99z9z0Mm7JiUn7+re/viNG6fVIOLv//8MQL8zMjIyMPz6/ZclQlrwaaeW9PUDH78LRhy5ZT7zxnOFjz9/s37/85cZWTMLzAR2oM5//xkYX/34w/njzy/WWA3Z+75ywi/6rz1VKrr6VOf4yw9ikpwsP9rNVC+haAZayPALGDw/gbr3vvvCzfX3HztI/BvQFSADQYqYGf7/Y2Jg/IdhMzMj2ASQu/8/+vmHleXHb57ZN57L9919qSTIxMgwVV/2YoCc8HNWZiZkzawsED+DbQfZwCjHwfpzypP3whc//+CKlxF8EqEs/kiBF2u8P2QEBtRmiS0XnL7/+ssZLcX3RI2b4/v733+Z/WSFnhmL8n3EE1XZYJu12Zl/nv/1m+Ptz98cfprSd5T4ub4SiOPDQPwepPmXChfbx0/AkDER4H4jwcX+GSj2B4em10DcCcRPQfoAAgwAue27yfvcd0oAAAAASUVORK5CYII%3D", "mi_12_top-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAeNJREFUeNqEks9rE0EUx2dmZ7M/ZJNFd7MRJWltS0sFEQsBDznYguixiDdRb96FHgQP3rx68Q+wXiqeWkSQntSC2IBKUUjEtrQ2q21iNpq4yXR25znBRqiY+uDD4x2+733nzcMAMIcQUiVo5vWn018Y13cEVu6MZcpnM3YNo/5BJdpeRqUWS211uP5VAH1VbXpDSYN5psb6iYkEekWxzY3SbqRP2mawsP3dnV76mH9Q9rNhFCv9xH9CIxhSlMRXBpzN+cJocdpLVm+Xt8cuvyjln32uuweKYwAUCYQMgmUjAid0tfNwIvfG0hKdG2/Xz9xcXj31/lvLau85oX93UqCbMQojofghM6dybmXu2OHaYiVwrhfXJp7vNJ3z6UO1u/mRlX2Tu5vFGKOGAFgNmbbU6NgcgHABmMWCKAqBBMFCNhe9yWpPrEg1lQBG0IwEXm8zY3Er8B75QXql0XKuHnc2rw25G1nLaPfEG5Lc7zcjxOXydQTE02hcZlHi1ofK+NQRszabH14uHLXr+5zKI8nKfL9bZJ68mwx4pJ9LGY2LbrJa54KOp/QflwbTPpU/8a8jCSQvJYWTmsJ8aXot5Maopf28MJD20X8urCm5J3mc09WnFiW2Smk8nDS7FncPEv8SYADM6MEGk8oegAAAAABJRU5ErkJggg%3D%3D", "mi_12_bottom-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAd5JREFUeNqEUs9rE0EUnpmd7C/ZNNXdbEqlqTalpYIHC4EecmlB9FjEm6g38dTiQSh48NZj/wb1Uo/qSXpSCoUGFIpCE+hPm6Vt0iY1dZPp7sxztpggtakffAzv8L353nsfBgAkoUr2Ti0VPxwEvHtfYOXlcKowlkpUMOoMKmlJPpXMrftBaqcZ6LsC6FK57g7EDeaaGuskJpLdkTAq8o3AWD0J9fGEWX2/d+RMLhazrwpenx9ypZP4eavQCIYuSviDfnv7XW4oP+nGyy8Ke8P3P69mP/44dM4Tp1sFl/OHAiGDYNmIwHU91nwzmv5iaWrzydeNW8+W125+Ozi2Gn+cRDMHkrFWJwWiFyM/FIrnM3Mi7ZTmey9XFkpV+3F+ffTTft2+nbxUmc0OrpC/bUSbxRijmgBY85m2WGsmAgASCMCMC6IoBFSChWwuWj+3oUg1lQSMoB4KvNFgxsJO1X3rVZMrtWP74VV7+9GAs9VnGY1/xByiGQDpCIirUV5goTrzvTQyccWsvM5mlnM9icOzd26DAcI1LuhccTdz14mXp9PO5kiX/vPetaRH5SXOC0k7RDc0hXnStAyLMWRpv+70Jz30n4RFCTpdQMZUjyxKWIxSnombkcWTi8S/BRgAmj682wCJjdgAAAAASUVORK5CYII%3D", "mi_12_bottom-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcpJREFUeNpi/P///1oGKCg9ecdgz6cfAvUq4rc95YSfszMz/WNABa+BuBOInwLxLyYgwQbDN7785L/x+afAsTefxR9++i6ALAfF0kA8CYgLgJiXCdnY099/c9rxs3+8+e0nZ9CJO6Y9lx6pvfr+i40BE9gCsSCKZnYmxv8uovwvV1irnatSFrs3//F7Wc+D1y0X334h+/PvPyY0A8pQBP7+/w8ygIGThfkvDyMDwzQD2Uu2Inyv624810w6ctvk0PMPwt///GWGKpdH0QzisDIyMvz595/pybdfXJIcrD8nmCheW2+leuLOj58csafumTadu6cNVf4bRTPQMoYP//4zvPv1h3nP26+CH//8YwGJg2xjBBrKwcjwl4mBER4DLMiamYG6/zEy/Pvz/z/jnR+/2U+//iI8/8Eb6a0v3ku6ifC9STOQu6QnzPsJq+a//xkYuIGu5wHG7w8Ghv9Nt16omfCxf5ioJ3/ZW17kBSswQJHVo2j++Z+BcemTt9I///5lTpASfCHAzvwzWkn8MT87yx8s0YWqWRuo+PK33zxCLIx/krRk7wE9+p8BN2AEaf4F46lwsX38y8z8R1uA+y1Q408G/OA3QIABAI0UrKBzP5VQAAAAAElFTkSuQmCC", "mi_top-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhdJREFUeNpi/P///2YGKgEmGKP82E1DyS0XnaZceaLy7sdvtv9kGMYIcxn3+rMev///Z2ZjZvyrz8bys0hN4raTtNBLQQ7W3yS7jIGRgSFUmPvNNjPl0/ycbF+jLz3WTT5603TXk3eiH3/+YSHJsH9ALMjB9t1OUuDtNgfNUyv1ZK/c/vWP3f3kXfPas/f0jr/8KPjv/39GogwDqfr37x+Yf+/DV973339xLDBWuNCoLHZ7zbtvwkHHblv2XnykfuXdV16Chv0HhjgPE4T7/c8/1nufv/OKc7D8rDOQv7nZXPlUkAT/07I7r1QyT98z2nT3uQw2w1iQw+wnNAq//QMymJj+//n3H2y6sSjvRyC++Gj3Fb4tH7/z/7n+Qs1PWfIJbm8C9f/4/x9s3K63n3mWPPsg/envf2YQfx8wEjKO3Tbc+vkHn6cA1/saTckbeF3GCHQZEzR4OZiZ//EzM/259vaLwIr7r2X6H7+Vk2Rk+D9FXeKGu4zQC2V+rq94DQM6iZGNkRHsMkl2lt8Xfv1lKbr2TJP5/z/GClmhR/4Koo8NRHg/4YtNuGFAV/2/BfTGzsdvxf7++M3hwMvxRY6T9WuGmsQdQ1G+jxzMTP8IJDNflMS488M3/ovnHxg0KIndW2qrfpyLmemvADvLH2JzANywMAHOtye+/eGqVBJ5GKYs/pidhfkvCdnSFyVvkgl8kTkAAQYAbmfb8yTRFZsAAAAASUVORK5CYII%3D", "mi_top-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAh9JREFUeNpi/P///2YGKgEmbILlx24aSm656DTlyhOVdz9+s/0n0jBGbC7jXn/W4/f//8xszIx/9dlYfhapSdx2khZ6KcjB+ptklzEwMjCECnO/2WamfJqfk+1r9KXHuslHb5ruevJO9OPPPywkGfYPiAU52L7bSQq83eageWqlnuyV27/+sbufvGtee/ae3vGXHwX//f/PSJRhIFX//v0Dy9378JX3/fdfHAuMFS40KovdXvPum3DQsduWvRcfqV9595WXoGH/gSHOwwSR+v7nH+u9z995xTlYftYZyN/cbK58KkiC/2nZnVcqmafvGW26+1wGpo8FV5j9hEbht39ABhPT/z///oNNNxbl/QjEFx/tvsK35eN3/j/XX6j5KUs+we1NoP4f//+Djdv19jPPkmcfpD/9/c8M4u8DRkLGsduGWz//4PMU4Hpfoyl5A6/LGIEuY4IGLwcz8z9+ZqY/195+EVhx/7VM/+O3cpKMDP+nqEvccJcReqHMz/UVr2FAJzGyMTKCXSbJzvL7wq+/LEXXnmky///HWCEr9MhfQfSxgQjvJ3R9IMN8gRgl4QJd9f8W0Bs7H78V+/vjN4cDL8cXOU7WrxlqEncMRfk+cjAz/cOVAxjQDePZeNbj2+9/zBJsTL8blMTu+SiJP+ZiZvorwM7yB18OgHkTxXVhApxvT3z7w1WpJPIwTFn8MTsL819i8ya6GNmlCECAAQBoHeDS2q/MOwAAAABJRU5ErkJggg%3D%3D", "mi_bottom-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAidJREFUeNpi/P///2YG8oEvMocJXbb82E1DyS0XnaZceaLy7sdvtv/4DdsMxWDAiO4y7vVnPX7//8/Mxsz4V5+N5WeRmsRtJ2mhl4IcrL8JuRLDZQyMDAyhwtxvtpkpn+bnZPsafemxbvLRm6a7nrwT/fjzDws+0zAM+wfEghxs3+0kBd5uc9A8tVJP9srtX//Y3U/eNa89e0/v+MuPgv/+/2fE5mUmLA5j+PfvH1j83oevvO+//+JYYKxwoVFZ7Paad9+Eg47dtuy9+Ej9yruvvARd9h8Y4jxMEOHvf/6x3vv8nVecg+VnnYH8zc3myqeCJPiflt15pZJ5+p7RprvPZZD1smALs5/QKPz2D8hgYvr/599/sOnGorwfgfjio91X+LZ8/M7/5/oLNT9lySc4XcYI1P/j/3+wcbvefuZZ8uyD9Ke//5lB/H3ASMg4dttw6+cffJ4CXO9rNCVv4HUZI9BlTNDg5WBm/sfPzPTn2tsvAivuv5bpf/xWTpKR4f8UdYkb7jJCL5T5ub7iNQzoJEY2RkawyyTZWX5f+PWXpejaM03m//8YK2SFHvkriD42EOH9hC1pYBgGdNX/W0Bv7Hz8Vuzvj98cDrwcX+Q4Wb9mqEncMRTl+8jBzPQPVzrDyAE8G896fPv9j1mCjel3g5LYPR8l8cdczEx/BdhZ/hDKqBguCxPgfHvi2x+uSiWRh2HK4o/ZWZj/EpvrGSksNVAAQIABAPq74YUHnrHGAAAAAElFTkSuQmCC", "mi_bottom-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAh1JREFUeNpi/P//PwMa2MxAJmBCMwRsUPmxm4aSWy46TbnyROXdj99s/4k0jBHqMhTXcK8/6/H7/39mNmbGv/psLD+L1CRuO0kLvRTkYP1NrMuQrGBgCBXmfrPNTPk0Pyfb1+hLj3WTj9403fXknejHn39Y8BmGEUb/gFiQg+27naTA220OmqdW6sleuf3rH7v7ybvmtWfv6R1/+VHw3///jES5DKTq379/YLl7H77yvv/+i2OBscKFRmWx22vefRMOOnbbsvfiI/Ur777yEjQMFIw8TBCp73/+sd77/J1XnIPlZ52B/M3N5sqngiT4n5bdeaWSefqe0aa7z2Vg+lhwhdlPaBR++wdkMDH9//PvP9h0Y1Hej0B88dHuK3xbPn7n/3P9hZqfsuQT3N4E6v8BjeZdbz/zLHn2QfrT3//MIP4+YCRkHLttuPXzDz5PAa73NZqSN/C6jBHoMiZo8HIwM//jZ2b6c+3tF4EV91/L9D9+KyfJyPB/irrEDXcZoRfK/Fxf8RoGdBIjGyMj2GWS7Cy/L/z6y1J07Zkm8/9/jBWyQo/8FUQfG4jwfkLXh9UwoKv+3wJ6Y+fjt2J/f/zmcODl+CLHyfo1Q03ijqEo30cOZqZ/uHIARjrj2XjW49vvf8wSbEy/G5TE7vkoiT/mYmb6K8DO8gdfDsDqsjABzrcnvv3hqlQSeRimLP6YnYX5L7F5k+xSAh0ABBgAyXDg65JoZ0oAAAAASUVORK5CYII%3D", "mo_bottom-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAPCAYAAAChmULXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABQlJREFUeNrsWFtII1cYzt0YTSdq1MTVuDVWDW3jequ7aOqiVF30QSpdBX1Qq9D6IgZRC7X2QSiK6MsqBUULKqiFru1ecBf1Ja2XXZU1eIuJKV7WaDWaGI2XSTKdf+oss1KDkfbJPXCYzH/+8/9zvvP935kJHcMw2rn2iPauOW2Mc2BdK8CqRjVR4sczyQ9m10N3j1EOdsl59DOmXUt2eTycSkcxjMlh0u2RHNaJMkykTb7hveXFZaOXZdr1a3Qa7Qsfj52nn0hfIu6cwzz12sdf/qGJe76+62s+sbGcgeYSyzY3N9l8Pj+tr69PeJFPXFzcbXJcqVRKAwICkul0eiZcW1tbxaQd+mVyuuLrSnPg3YvLOfpULDA+vSt70ScPmtWeOtzSJpbja6b08rEts5cDw+jn57FcTdTe3i5OTU019Pf3B+Tk5Ow48y0qKpKtrq7yBgcHx+VyuRWALC4ujklMTDS7krOpqWn5fyIazeFwENWmNx3y945OuT/F3Hz1ZGPP78f1PcnPW1qR8n1f/T2J8PVH3h6WK5dnV1dXcEtLy8Ls7CwCrCPZl52dLQc2Acv29/fZRqOR3dnZKe3u7lYDYOAHINfX16u3t7eJeWq1WkCysK6uTgI2YCJpg5gQG8agU/MA28k5sDnnmQxj4AP9IpaCnHsy/oHgyOZg6y1HfH8u6+S7W8GaR/HSF5+LkNeVur9Cv36pj/5t2RB4JdCGh4eRoKAgq0gkQjMyMjYaGhqIh4ar2WxmGwyGZxUVFbqlpSXEx8cHjY2N3QFfaozS0lJDSkoKwbT5+XlkenpaNTQ0pMLBlBEnWlWVvLm5WQ2xICbE3t3dZUOn5gHwYQMBELDhB9pj/H4KB4uIU1NTI9dqtSMDAwPjKysrHhdR7eTsyLQ68B8MBmZzYAQmMb58c8udD2YyEXfz75Zj/g8Lm2FXAg3fxWBSY0wmE6e3t5e4V6lUviUlJSsAELAJwLpMvNzcXGIOgHhwcMCG8o2IiDBDDLBDTIhN+lPzAPgajUYFNmA9MLy6ulpmsViIOPAM0dHRip6enoDa2lrdv7860GjHZ68Pz40Wz+4N0419O8aE+xH8MPhqVBv1xHL83j0Bb+9bmXjRZU2D0hgbGxPCQuFeIBCc4tRHnR0Ik5OTQphHZRuUj06n4/0XmoSXNxEHWB8fH/9GJ5OSkgD4cciFV4dvZGRk8szMzAgpE29Aw5nGOJN5LpPpQJgM27zxQND753Zg85pRIqbTsAfhosW0QO9NKcI7dJlpUBrp6ekGEGWyl5WV6dra2oIVCsU2XAEgABHAgjmFhYXL+fn5cnJxMAblR10gtQHDFhcXEfCDWGRscpyaB6QiISFBATbQRgBKKBSi5eXl8rm5OV54eLgCDhzQX7FYbCV19C1Nw3Hj0OkE08RuLPTVqZ2lnN+QdeGAVQd5r/6SGD5a+mHgMhUwl0CDUszLy9s4r08TExPCgoICg0QiseIPl9bY2BgaFhZGgNLR0bGA764JFgdCDQsCLXJ26sI4+EEsBEHQysrKVeopCjYYy8rKuo1vwAKMU234M+mg3PGcO8AwsMNmkzr61uJxJi3h5fdszehnP0a5d/ncg8+8ecb+O6HjVVE3F24J+fsXfRFc229Nz1+n0q2ogyniMNDvQ/z0mSH+azwmwy5wY9mczWPRrnG7L3A3jlttvG9ChCv3pf5rbiym/bLfnu/+1XCx/S3AALgmngx1FZ/fAAAAAElFTkSuQmCC", "mo_bottom-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAPCAYAAAChmULXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABR5JREFUeNrsWGsso1kY1htVOl/RVotRqy6pRHdmyyJiCZLaIJuwLlmRYP/s8k8Em2XtimQRix/LH4nI2h9slmWtCZOQiDWYIUZNFKWTaXdbs1ozVa1L+b49b2e+jcvIuO0fmZOc9Jz3nPOec573eZ/TlkIQxIDDu/K2knq0Q7nJoJU9WL770+au29d+HprPAjw1bkzGPuUawLvRoLn8NptkIwiaI41y+L4jfa84SKCK93Z/jsCzXQU46o1OKkSrDA8Xw70PxY8wZ0dLjkIb+vnEcvj9vzZ5pr0D+mXdvhG08PDwyOLiYvFZi2CMHB8ZGcESExNlFAolBWp6erp0fX2d0d3dzQU/574fWnvdmOGoujEddz4Scoz34iQPu6W3n6j2cSf59FpE5axaOvnc5IYTxEUzduAUaAqFgoVhmG1wcNDrbathbm5uriwuLm4Dpfkfer1+GOxFRUWSi14Q1v8PRHPAcdx+R/VLC/vFzj6zQ+b3+DsxX/XrptUj7YEq6od5TfCTTQv7Skxrbm4WpaWl6aKjow2tra3Co+xis9lyLy+veAQWh5yblJSkr6io0EBfIBDYWlpalCKRyAL9ra0tBrCNZCDYgIXQBhv4IvcgWUnuA+MFBQV28GtqanzBBpVkOPghfQcHB8dAAE8HwsHBlfrqijsHOENt3mF7Mul739wRLQ9EiB+mCbC/S1f/CfjykfqD39f0PpcGbWhoSFhYWKjPycnR9fb2epEp2NXVJZqYmBhH41OLi4sY2BcWFjC5XL5xdD0A19jYuAbtlZUVrLa2VgkMnJyc5IKf+vp6X5PJxABbU1OToqyszJ7OMzMz3KP7zM/Pj8JZwNbZ2SlSqVSjUCEDSD+hoaEmYCgEWKlUst5EtT3iVdOKowaVShzghP3OMh7b1BIVOJ+COZv+NO+yv1euB50XtGNi+DqiNjKa09PTXIggOig3Ozv7mVQqtYId2udxHhYWZkhISDBB29vb22owGBjj4+O8kpKSVQA3KyvL0NDQYBobG7MH4eQ+Op1uFM5iNpsZqampMrBBG+ZFRESY0NxIjUbDAnkAX6cwQzjtEoQdtvtGs+vPupfenwYI1NAfRY/BLxqjz6B599bHHNaLovc8nl4KtP7+fi+IGtlHBzN0dHQIz1ocExOzMTw8zDt5YHgY4CJX1SQy5aKiogyZmZk60i6RSKwALPochfOhFA+Ym5vj9PT0KI4/Lohcr2WeSaPhGI16sGjc5nQ93fBp0hp9hRQH4sdgwZLcx31djLEsFwYNKA8a1N7eriRtkDaBgYHxfX19UyD4eXl5erBDCgEjoI80LRIx1AK6BvPhEYD0Q+usZwHd1tYmio2NtTNsaWkJgzaMJScnG8h9+Hy+LSMjQ4ZsOkjtqqqqVbChuZHV1dVK0FMOh7NPSgGps8c0DeHmSKHYmSZ0otse7x/Sixd1EhqBU8pvu2s+8eNp73DZWxcN5n+goWiJ4IAn9QnYhg6NIZ1bRSyMgfQNCQmxXxKijfRmtry8XFJZWWkXevSIaAYGBmbJlDtZSktLNQhYF6FQKEfVWldXp4B9YAxSGYIB+2xvbzPy8/PXSFCO2oDZXC7XBgAjXZSAHzjHKcFGTFpB6TesNfIPd23MODZz29eZYfkiSLB6l3fLxKRR8Uu9yjf5F4Fr/2yS1YbTBI5U27f+fHWKv6eWRaMecpzoB1fxS3e4wSWT42ycsh6wvvLnPssUe2qd6LTDa/n+9+5fjouXfwUYAL49j4poMJevAAAAAElFTkSuQmCC", "mo_top-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAPCAYAAAChmULXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABQlJREFUeNrsWG0sZFcYnm9jmN7BYMYytkYxaTvWV+2GqQ0pNmwilS4JP1CS1h8xETSp6g9JQ4Q/S5oQmiBBk612P2I3+DOtj11kTXyNGdP4WEMZZgzj487M7X1v927uSqmR7S9OcnLnvOc973vPc573OS46hmEPaVfNqca4zJuvGNZEiB9NJd6fXg3ePkQ52DnX0S8z09x+mUhFMYzJYdLt4RzWkTJEpE285rnhwWWjV0w7lTI02hdebltPPpG+QFw5+znqlY+//EMT82x129t8ZGO9M9DW19fZfD4/paenR3iaT0xMzE1yXqlUSv38/BLpdHo6PJubm8WkHfp5cjrj60xz4N2Dyzn4VCwwPrkte94jD5jWHjtcUsYWY6sm9PKRDbOHA8PoJ9exnE3U2toqTk5ONvT29vplZWVtneVbUFAgW15e5vX394/K5XIrAFlYWBgVHx9vdiZnQ0PD4v9ENJrD4SCIozft83cOjrk/RV1/+Xhtx+fH1R3JzxtakfJ9b/0difDVR55ulgszraOjI7CpqWluenoaAdaR7MvMzJQDm4Blu7u7bKPRyG5vb5d2dnaqATDwA5Bra2vVm5ubxDq1Wi0gWVhTUyMBGzCRtEFMiA1z0Kl5gO3kGjick0yGOfCBfhpLMVz53Rn/QHBgc7D1lgO+L5d19N2NQM3DWOnzz0XIq3LdX8Ffv9BH/rZo8L8QaIODg0hAQIBVJBKhaWlpa3V1dcRLw9NsNrMNBsPTsrIy3cLCAuLl5YVGR0dvgS81RnFxsSEpKYlg2uzsLDI5OakaGBhQ4WDKiButokLe2NiohlgQE2Jvb2+zoVPzAPhwgAAI2PAL7RE+nsDBIuJUVVXJtVrtUF9f3+jS0pLbaVQ7en1lWh34DwYDszkwApMob7656dYHU+mIq/l3yyH/h7n1kAuBhp9iIKkxJpOJ093dTYxVKpV3UVHREgAEbAKwzhMvOzubWAMg7u3tsaF8w8LCzBAD7BATYpP+1DwAvkajUYENWA8Mr6yslFksFiIOvENkZKSiq6vLr7q6WvfvfzrQaIcYRsD2zGhx71wzXdu1Y0wYD+GXwVfD2ojHlsP37gh4O9/KxPNOaxqUxsjIiBA2CmOBQHCMUx8960IYHx8Xwjoq26B8dDod711oEl7eRBxgfWxs7BudTEhIAOBHIRdeHd7h4eGJU1NTQ6RMvAENZxrjtcxzmUwHwmTYZo17gu4/N/0bV4wSMZ2G3Q8Vzaf4e65LEd6+00yD0khNTTWAKJO9pKRE19LSEqhQKDbhCQABiAAWrMnPz1/Mzc2Vk5uDOSg/6gapDRg2Pz+PgB/EImOT89Q8IBVxcXEKsIE2AlBCoRAtLS2Vz8zM8EJDQxVw4YD+isViK6mjb2kajhuHTieYJnZhoS+P7Szl7JqsAwesMsBz+UF86HDxh/6LVMBI0O6eBzQoxZycnLWT+jQ2NibMy8szSCQSK/5yKfX19cEhISEEKG1tbXP46ZpgcyDUsCHQorNuXZgHP4iFIAhaXl6+TL1FwQZzGRkZN/EDmIN5qg1/Jx2UO55zCxgGdjhsUkff2jzOpAW8/J6uGH3shyj3Np+795knz9h7K3i0IuL63A0hf/e0LwJ4XsqvAvdfJ1KtqIMp4jDQ74N89OlBvis8JsMucGHZzlpHatrdywjcPYGrcdRq430TJFy6J/VdcWEx7ef99jxpu/qvx3+0vwUYALROnUAxYud0AAAAAElFTkSuQmCC", "mo_top-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAPCAYAAAChmULXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABRRJREFUeNrsV2sso1kY7l2VzldUtRiddU0l7MxiEbEESW1oNmFdEpFg/+zyTwSbsHZFsojFj+GPRCT2B5tlGWPCJCRiDWaIaYmimEw725rVmqlqXVrft+ft+jYuK+u2f2S+5MQ57znnPe953ud9jlIJghigfPgu9dFu8+XKni0/ED2WJzxceOO/tWdlETfkl3qbmeb022yylSDoLDr18GMWY784UKhK8HJ968JmWj8w7VxKUCgZbk76J5/6vcAcWeYchSbkq4nliKdvttyN+zbGjYIWERERVVxc7HfeJpgj50dGRrCkpKQwKpWaCi09PT10Y2OD2d3dzQc/F74f2nvTmOGoubBZu5+JeIYn8ZLn3aF3F1QHuIN0ei2ycnY9dPKt0QUnCOq1QVMoFBwMw6yDg4Oe/7UZ1ubm5obFx8dvojJ/rNPphsFeVFQkuWwgsP9/IBoFx3H7Hdffm7nvdg/YHWH3Xv7gJ1D9umVxS3umiv5Jrg5a2DJzrwVac3OzOC0tTRsTE6NvbW0VHWcXl8uVenp6JiCweOTa5ORkXUVFhRrGQqHQ2tLSohSLxWYYb29vM4FtJAPBBiyEPtjAF3kGyUryHJgvKCiwg19TU+MDNmgkw8EP6TsoKCgWEng2ERSKM+3vK+7acOa6aZfrwWbsf3dfvDwQ6fc8TYj9Ubr6p/83L9Y/ebSm874yaENDQ6LCwkJdTk6Otre315Mswa6uLvHExMQ4mp9aXFzEwD4/P49JpdLN4/sBuMbGxjXor6ysYLW1tUpg4OTkJB/81NfX+xiNRibYmpqaFGVlZfZynpmZ4R8/Ry6Xj0IsYOvs7BSrVKpRaFABpJ+QkBAjMBQSrFQqOf9Gtf2jJ9OCow6NRthwwn7nMHeusSU6QJ6KORp/N+1xf1RuBF4UtBNieJRRK5nN6elpPmQQBcrPzs5+HRoaagE79C/iPDw8XJ+YmGiEvpeXl0Wv1zPHx8fdS0pKVgHcrKwsfUNDg3FsbMyehNPnaLXaUYjFZDIxZTJZGNigD+siIyONaG2UWq3mgDyAr7P/GlAoewRhh+2pweT8s/a915f+wnUYj6LH4Be1wXvQtHfncx7nXdFHbq+uBFp/f78nZI0co8D0HR0dovM2x8bGbg4PD7ufDhgeBrjIdTWJLLno6Gh9ZmamlrRLJBILAIv+jkJ8qMT95+bmeD09PYqTjwsi15HMs+l0HKPTbIuGHV7Xq03vJo3BR0SlEA+DhEtSb9cNP4xjvjRoQHnQoPb2diVpg7IJCAhI6OvrmwLBz8vL04EdSggYAWOkaVGIoWbQNVgPjwCUH9pnOQ/otrY2cVxcnJ1hS0tLGPRhLiUlRU+eIxAIrBkZGWHIpoXSrqqqWgUbWhtVXV2tBD3l8XgHpBSQOntC0xBuLCrVzjSRA8P68uCQUbyoldAJnFp+11X9xT13zX0+d/uyyfwHNJQtMQR4Wp+AbShoDOncKmJhLJRvcHCw/ZKQbaQ3s+Xl5ZLKykq70KNHRD0wMDBLltzpr7S0VI2AdRKJRFLULHV1dQo4B+aglCEZcM7Ozg4zPz9/jQTluA2YzefzrQAw0kUJ+IE4zgg2YtIKKr9hjUFwuGdlx3PZOz6OTPPXgcLVB+53jGw6Db9CAchu9S8C5/7ZZIsVpwtZNOv3voL1VF8PDYdOO+Q5MGzXcCtjUG7xl8lzNExZbJxvffmvM/08NA4M+uE1Xcpu/W/PG/xkxwd/CTAA5MWM8tMFQm0AAAAASUVORK5CYII%3D" },
                          b64ig = { "mi_12_top-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAB60lEQVQoU2P8////JgYs4NrHb5wPv/3ikOdi+6HFz/UdmxpGdM0rH78VrbryWOve1198nExMv7//+8eqxM32qU1H9lq4rPBrZENQNE+4/Vy69NITgwwl0VulapIPOZgZ///4+5+x+9Zz+Rn3Xqt168lcKFCVfAozAK75/tcf7Jo7Lzt368lezFWReLrm6Tvh0ON3rFZbqhwLkRZ6O/nOC6DBj/Wvu+vuVeTm+AkyAK659PIj5W3PPkpeddc9ApI49+Erd8/N5wol6pIPjAS4v4LEtHdetvGS4n/erSt3F0Wz5+GbhrJcrN9nGSvdAEmcfPuFp/HaM5V6Lak75sI8X0BiaWfvaTz+9ptzu636eRTNXodvGUhysvyca6J0HSSB7myQWPKZe5rPv/9h32ardgFFc9Xlx4qrn76Tve2hfwiXZtUdF+1CpYUet+nK3kfR/PzHL1blbZecqzQlr9doSj9Et7nl+lP5tuvPNe966e2V5GD7DdT8HyWqFj54I55y9r5JuKzgg1xliYc8LMz/vvz5yzT57gv5lY/fK8wxVjwTryDyEhpVdzASyY4XHwQqrzzRuvjhm/B/UHQAsb4A19t2HZlrHhICH6AaQVKNGJphCeAV0BuPv/1ik+Vi+yUGcSYMgKJpMSMj4zkAno8G/I6W9gAAAAAASUVORK5CYII=", "mi_12_top-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAB8klEQVQoU2P8////JgYs4NrHb5wPv/3ikOdi+6HFz/UdmxpGdM0rH78VrbryWOve1198nExMv7//+8eqxM32qU1H9lq4rPBrZENQNE+4/Vy69NITgwwl0VulapIPOZgZ///4+5+x+9Zz+Rn3Xqt168lcKFCVfAozAK75/tcf7Jo7Lzt368lezFWReLrm6Tvh0ON3rFZbqhwLkRZ6O/nOC6DBj/Wvu+vuVeTm+AkyAK659PIj5W3PPkpeddc9ApI49+Erd8/N5wol6pIPjAS4v4LEtHdetvGS4n/erSt3F0Wz5+GbhrJcrN9nGSvdAEmcfPuFp/HaM5V6Lak75sI8X0BiaWfvaTz+9ptzu636eRTNXodvGUhysvyca6J0HSSB7myQWPKZe5rPv/9h32ardgFFc9Xlx4qrn76Tve2hfwiXZtUdF+1CpYUet+nK3odp3gjy+/Mfv1iVt11yrtKUvF6jKf0Q3eaW60/l264/17zrpbdXkoPtN0xzH5ChAuIsfPBGPOXsfZNwWcEHucoSD3lYmP99+fOXafLdF/IrH79XmGOseCZeQeQlclQZATn1INtBgjtefBCovPJE6+KHb8L/oYL6Alxv23VkrnlICHxASSQgDjCVgQyIBWJlmOQroDcef/vFJsvF9ksM6kxkjSA2APzOAVAclIUNAAAAAElFTkSuQmCC", "mi_12_bottom-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAB+klEQVQoU2NkAIL///8bAalYIFYG8UHg2sdvnA+//eKQ52L7ocXP9R0mjkwzQjXWAwUZQRIrH78VrbryWOve1198nExMv7//+8eqxM32qU1H9lq4rPBrdM19QAEVkOCE28+lSy89MchQEr1Vqib5kIOZ8f+Pv/8Zu289l59x77Vat57MhQJVyacwA0A2bwTZev/rD3bNnZedu/VkL+aqSDxd8/SdcOjxO1arLVWOhUgLvZ185wXQ4Mf619119ypyc/wEGQDSvAnEKL38SHnbs4+SV911j4D45z585e65+VyhRF3ygZEA91eQmPbOyzZeUvzPu3Xl7qJo9jx801CWi/X7LGOlGyCJk2+/8DRee6ZSryV1x1yY5wtILO3sPY3H335zbrdVP4+i2evwLQNJTpafc02UroMk0J0NEks+c0/z+fc/7Nts1S6gaK66/Fhx9dN3src99A/h0qy646JdqLTQ4zZd2fsomp//+MWqvO2Sc5Wm5PUaTemH6Da3XH8q33b9ueZdL729khxsv1E0gzgLH7wRTzl73yRcVvBBrrLEQx4W5n9f/vxlmnz3hfzKx+8V5hgrnolXEHmJHFXg0IaBHS8+CFReeaJ18cM34f+g6ABifQGut+06Mtc8JAQ+IKuFRxWyIIj9CuiNx99+sclysf0SgzoTXQ0A/M4BULvcldoAAAAASUVORK5CYII=", "mi_12_bottom-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAB8ElEQVQoU2P8////JgYs4NrHb5wPv/3ikOdi+6HFz/UdScldIHsxIyPjOUZ0zSsfvxWtuvJY697XX3ycTEy/v//7x6rEzfapTUf2Wris8GuoIf+BdCOK5gm3n0uXXnpikKEkeqtUTfIhBzPj/x9//zN233ouP+Pea7VuPZkLBaqST6EG3IFrvv/1B7vmzsvO3XqyF3NVJJ6uefpOOPT4HavVlirHQqSF3k6+8wJo8GP96+66exW5OX4CDfgP11x6+ZHytmcfJa+66x4BmXzuw1funpvPFUrUJR8YCXB/BYlp77xs4yXF/7xbVw7kbwa4Zs/DNw1luVi/zzJWugGSOPn2C0/jtWcq9VpSd8yFeb6AxNLO3tN4/O0353Zb9fMomr0O3zKQ5GT5OddE6TpIAt3ZILHkM/c0n3//w77NVu0Ciuaqy48VVz99J3vbQ/8QLs2qOy7ahUoLPW7Tlb2Povn5j1+sytsuOVdpSl6v0ZR+iG5zy/Wn8m3Xn2ve9dLbK8nB9htFM4iz8MEb8ZSz903CZQUf5CpLPORhYf735c9fpsl3X8ivfPxeYY6x4pl4BZGXsASDkUh2vPggUHnlidbFD9+EQSmBEYj1BbjetuvIXPOQEPiAnBgxNMMkXwG98fjbLzZZLrZfYlBnImsEsQGH1Qb8+LOc4wAAAABJRU5ErkJggg===", "mi_top-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAABaUlEQVQ4T2P8////JgYqAUa6GPb420+25utPlQ68+Sz24ecfNgF2ll8OIryvajWl78lysf/C5hmsLtv+/INgxMm7ZmLsLD9CZYQeKXBzfH/w9Qfn6ifv5F79/MOxwlz5lKekwHt0AzEMu//1B7verqsOXlJ8T5eaqVw99PoTX8/Nl4ol6uL37UT5PkWfuqO97dkn6Utu2gcUuTl+IhuIYVj8qbuax99/EbnmpneEhZHx/6x7ryXSz903nWmkeDpNSfTFn///GbV2XbKxFOR5s9BM+TpewxS2XnRIURK5X6Mp/RCk8NOvP8yPv/9ml+Vk/cnHxvIXJNZ49Yn8/AdvFR946x/AaxjP+rMe040UzsXKC78CKUR3GUhs8cO3YpnnHhh9CTTeQZLLsBlGtMuoGmbosbnt+XvB+mvPNBq1pG54SQq+xxObf6mZzu7gzE5k5IA+auXNnYyMjFMpMQyU5u4B8WagQeD0BgCWlyJp2U3T3gAAAABJRU5ErkJggg===", "mi_top-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAABfElEQVQ4T2P8////JgYqAUa6GPb420+25utPlQ68+Sz24ecfNgF2ll8OIryvajWl78lysf/C5hmsLtv+/INgxMm7ZmLsLD9CZYQeKXBzfH/w9Qfn6ifv5F79/MOxwlz5lKekwHt0AzEMu//1B7verqsOXlJ8T5eaqVw99PoTX8/Nl4ol6uL37UT5PkWfuqO97dkn6Utu2gcUuTl+IhuIYVj8qbuax99/EbnmpneEhZHx/6x7ryXSz903nWmkeDpNSfTFn///GbV2XbKxFOR5s9BM+TpewxS2XnRIURK5X6Mp/RCk8NOvP8yPv/9ml+Vk/cnHxvIXJNZ49Yn8/AdvFR946x/AaxjP+rMe040UzsXKC78CKUR3GUhs8cO3YpnnHhh9CTTeQZLLsBlGtMsoDbP1QKcyw5yLHpvbnr8XrL/2TKNRS+qGl6Tge0Kx2Qc0SAXZ75SkMwegQUXoCZCsHAAyBJg/s4GUO6X5nRFmANBAkAt9gVgJOQxJsQAAhcgbYNada7cAAAAASUVORK5CYII=", "mi_bottom-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAABe0lEQVQ4T2P8////JgbywF+gtntAvJmRkfEAyAhGCgxDdsJOoIFTcRr2+NtPtubrT5UOvPks9uHnHzYBdpZfDiK8r2o1pe/JcrH/wuKZPqyGbX/+QTDi5F0zMXaWH6EyQo8UuDm+P/j6g3P1k3dyr37+4VhhrnzKU1LgPZqBdzAMu//1B7verqsOXlJ8T5eaqVw99PoTX8/Nl4ol6uL37UT5PkWfuqO97dkn6Utu2gcUuTl+Ihn4F8Ow+FN3NY+//yJyzU3vCAsj4/9Z915LpJ+7bzrTSPF0mpLoiz///zNq7bpkYynI82ahmfJ1ZNdhGKaw9aJDipLI/RpN6YcghZ9+/WF+/P03uywn608+NhZQDDI0Xn0iP//BW8UH3vrgWIQBDMN41p/1mG6kcC5WXvgVSBG6y0Biix++Fcs898DoS6DxDpJchs0wol1G1TBDj81tz98L1l97ptGoJXXDS1LwPZ7YxJ4DyExnuLMTGTmAankTHKnUyuhgwwDUgyJp9KU0/QAAAABJRU5ErkJggg===", "mi_bottom-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAABhklEQVQ4T2NkgIL///87AJm+QKwExMwwcVJoRpBioEHZQMqdFI3Y1DJCXVSELvn420+25utPlQ68+Sz24ecfNgF2ll8OIryvajWl78lysf/CZVgfUEIFWXL78w+CESfvmomxs/wIlRF6pMDN8f3B1x+cq5+8k3v18w/HCnPlU56SAu/RDQS5bD1yGN3/+oNdb9dVBy8pvqdLzVSuHnr9ia/n5kvFEnXx+3aifJ+iT93R3vbsk/QlN+0DitwcP5ENBBm2CVkg/tRdzePvv4hcc9M7wsLI+H/WvdcS6efum840UjydpiT64s///4xauy7ZWAryvFlopnwdr2EKWy86pCiJ3K/RlH4IUvjp1x/mx99/s8tysv7kY2P5CxJrvPpEfv6Dt4oPvPUP4DWMZ/1Zj+lGCudi5YVfgRSiuwwktvjhW7HMcw+MvgQa7yDJZdgMI9plVA0z9Njc9vy9YP21ZxqNWlI3vCQF35MUm6AwoCSdoSQNWICSmwOwGkZOPsVItOQYAtMDAIXIG2CgPMofAAAAAElFTkSuQmCC", "mo_bottom-right": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAPCAYAAAChmULXAAAGOklEQVRYR+WXe0xTZxjGbYFS5Ca3WkCw2HJrTQCBmUK5CssIanRgVLwRLzNhk82EQNy8xRvJ3B8awBCjLvGGI25TlChKAaGUOYEpmAoU5FKgtBVoFSmUS/d8hC7ImlG2/bGMk5wU3u/9zvnO733e5zuHssjIodfrzRAOmz798bsEJ9VY7kKMUWY/NID5IfYlTveFAkQ+orMQKt4tGZ6YNOPY0rQxLvaaP4GZAeODMQALx1gGTqK0//0hGx6lfVbXyStRatz1+kUUCwplckyvpzJo5tpvuK6SdA6z1xiEP6BNKyx7oQB7PTRCDyt/FW5Gpeq/9mO+Sl3urLA2N5t8oX5vnd0s9/pBNuj1BdulKSeIJZ0NbgratIflzrclN2/evHLr1q3yDRs29BuryM6dO7lXr16VkLGcnBy3W7duLZuYmKCEhYX1nzx58rW1tfXkzJy/krZEIrG6fv0688yZM+3/RguECCX8Qd0YrSbGX8yg08bS6jt8fuoZ9KyM8hf52NFHvmuRL8ts6A4q5LPFye6OHzyfAZoAC8mcz2KKi4sd9+/fH+Dp6fleLBb/amwuk8mM6+vrKz18+LBXUVGRW15eXqOTk9NYVlaW7/j4OOXBgwe/GXLmurdMJqM9evTIYc+ePYq5cucaf9inXpIgkkYII30qYxn2GpI/GxqJRVa8CtWO682exXF/mXlNA7QsBImfmXysW7cuYOPGjYojR45wKyoqxN7e3iNKpdJi165dK9va2mwjIiJUAOsul8tLHR0dPwbYKn9/fy25gUajMTt27JjXuXPnWp2dneOhPFVra6ttTEyMAmBburq6LFEQHmI2fn5+msuXL0u6u7tp+fn5HhcvXmzCyczNzWWTa+3bt6/jwIEDPUKh0B7F4Gq1Wirmtqenp/eeOnVqOVE3FS2YkZHRClUryZyvnndyfuxRe8gSA8oNDyxFu3Zrx2irHRYPLUabknh+m8L18+ey4NFPg4vNKRS9IdcA7XsEnEwlNjAwYM7lcqM6OzvLsWBvS0vLSbSfFG0a4OrqqiV/Hz16lHXlyhU2YIlCQ0Mj+vv7Hxu7PoVCWXv79u2a+Ph4ta+vb1RdXZ1oy5YtAXw+v//EiRPtuL4v1Gp58ODBdoD2vXTpUmNkZKSgqqpKRKfTJ8NxVFdXi5Effvfu3acMBmMsKiqKf+fOndqQkBCyxscoHO348eMcqP0FWUPK01Zeyzudbe0MBZFYgWxwxcv4lUKevdUwyTMoUrE24CFp4dnQfkbA5B0TFfSEIjhEGb29vVbNzc32+BVyOJwotNxTHx+fEdJ+Hh4esfX19ZVsNnvN8PDww5nQoJ6lUKXSzc0tDgqdAhoUFBQG33oO5QkQKyXFaG9vt4Rqw69du1ZLoG3fvl0GBS8FoCkA5ABAu8TERH5gYOAA+V8qldplZmY21dTUOAAoIzg4eGDv3r1d69evnxo3pjRj0OZSWpGpKiN5UJlg9+7dHSwWa6rdDh06xDt9+rQkOzvb5+zZs5K4uDg1eVhUP4J4GvKiEX+5adOmNyQfD2OL1l5NxmZ6mgEa5vMrKyurScsTIMQ7UaQXBFpaWlrHhQsXWBh/Rq6FllwBq1ClpqYGQdU1JPbkyRN7FEqLNqfHxsaqoTonKDYQ7V7m4uIyXgJP+wSeVgpPWzPtacagzeVpJkMTiUS2qHZwR0dHhQE0aUWAcEQlFefPn2djR+0qKSlhYtE2BAx8xQUeEwhonTY2NuPYUVkA3UR8xxg0qIp57949N7R7D+Z6AlTbqlWr3hJo9+/fr+fxeJEJCQlycn+Acm5sbBRBnR9BtSMAPXTz5s3lgCoWCAThSUlJMhqNNnnjxg0WFFhOdmwyb/buORuaKbunydAaGhoWq9Vqc/jKWwM0sgEAksOOHTuUZWVl9rW1tXbwlUFU1mrbtm0qktfS0kIvLCxk6HQ6KuC+gd8MkTgexsWQA89xjI6O1tjZ2U2gzR0AwwZ+qIENvCX3gN/ZANagSqUyLygoYACGPiUlRUnyR0dHKSjG0qGhIbPk5GQVrEEHL7OAXzLIfQBPBag6w5pnv6cluTu8Id+J3SM6y2+b+1imvKeZDG0+bfxfz/1HXwR4uV2Q0AxF/Vvfngsd2nw74nftIYd+qU9g8gAAAABJRU5ErkJggg===", "mo_bottom-left": "data:image/png;base64,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", "mo_top-right": "data:image/png;base64,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", "mo_top-left": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAPCAYAAAChmULXAAAGYklEQVRYR+2Xe0xTVxzHubSltSJSoJUWy6MgFcpr1PEQ5I2Iy9DpfETmKyEQtsXHdCpRY+J0ggHiVFDiI5GoM0IM4nQgICgIyksEx0OoUKQPWh6lj9FCC/sds7so4kC2v9huctP03N8953c+5/v9nXOx8fHxfKP/r2kTwDAsBpvt0JR6PaFQqqQN6Awk5hyiLmqBuYJMwMamTWlC4KyGptEbjL+uF3J/ft3vMDpuRCBhRgb0SyUYjyZy6O3JHuxXRAwb/1h4sxYaAub/oNW/U6Mz/Y7LaPuGYy1iUIij3RodOb1dys4UyJyD6PN6i4IW12EfSe1voe3du9fRxsZGu3v3btFk/cbHx3NTU1M7zMzMDLdv37Y4e/asw8DAAMnNzW3oxIkTAhaLNfJ2zFS5bdmyxTU7O7t5qrjpPP+qWsDLFw8tLAvhVnibz9VkCHqZPzSLeWkets9j7Szlv0oUtFWVHUu/51o3H3db2DmdPvGYD0ITi8UmPj4+ARCIdXV1lRKJxPdk7OTkFFwJ18OHD+fv2rXLIyMj47mHh4fm1KlT7Hv37jHb29sfLVq06E0Mg8EYnSqx5ORk2wMHDnRPFTfVc5lWT2L90rD8uDurcT+X9RrFT4SG2hLqOrm5okHb3s8/Kf4Ym34QWlJSEketVhMaGxvNExMTuzZu3CjX6XTGSDlVVVV0AKZqaGigwV0eHR3N37lz5ytQigyfEFLpvn37upfC5evr21dTU2PB5XKVubm5jXq9HoN+XKqrqy1BjcOnT59u9vT01ERGRvKLiorqSkpK5sO7LlqtlhAeHi6D5+0vX76kwDvusJiUlStXSmBhOq5evUpPT093QnmtX7++58iRI0I0fnZXH2N7bdengzFeBWYmRANqk2hHSK0q3RzevDnDyKaorV6hmcsvbg6rCnUp87M0VU21GH8+NwC0LybdPTkcTvCdO3dqysrK5t+6dYsFE6k7dOiQw5MnTyzu3r37LD8/32LDhg3+Uqm0ANQU9uLFi1I2mz0ycWCkxtjYWOHhw4eFgYGBPnv27BEUFxdbSSQSck5OTtO5c+eYmZmZHIBSbm1tHSEUCktsbW3Dr1+/XuPn56cKDg72OXbsWCtAdD148GA7LNBAVFQUPyEhQXj06NHFALQRHKEGaJ6FhYV1ZDJ5/GSbmP1jq9RFscr7Pp4PatvfJPLK8raviefQpagd1T3TvPrPcvwdK7+0seifJrR+gLb9PWgFBQXma9as8Vu9evVrWEUC1Ct2Z2dnEaw0DxQn3rp1ay8awMHBIeTp06ePoYaFANwKV1fXYXzgvLw8S1CYctmyZUvLy8srmUzm6KZNm3ghISH958+fd0hLS/stNDRUieJpNNrynp6eYkdHxzCYeBUA8G5rayvH+4IcMKib0dCfHLWB2qhBQUEyUKn20qVLHB6Pp1i3bp0YQEo+pLTJoM1QaY8BWsp70ACWJ0ooLCysDyUBarBfsmTJINQ2qpeXlxKs240sRqfTI2FypQDDnc/nK1JSUl6heLlcTgSFhbe0tJTC5PzxmoZDu3btGjsuLk64efNm2dDQEAEUGgG/hQA2AqxfHhAQECgSiUogOaMzZ86wYEz12rVrfWtrax9RKJSxpqYmqomJyTjkQwHAclAuDUqIZ1ZWVgMocXCymjYZtBnWtJOQV8U70NAk7OzswqGIPwAoegQBWXHHjh0ely9ffgZW44PSuurr681LS0uZMLn7oBKTFStW+ENNkoCtNTdv3mSjWgS2a8M3C7QR4NCoVKoB7Oa+bdu2TqhhC0ChyitXrjQje4Ldi6EM+lhZWemcnZ3VN27csIV6WAHWdISc5oFd+1DbhQsXniHLQowKxtDAf0dwSBVsRL+jnCfunhOhzXD3RKeIbwGa4R1oUGtIYDkzUNtfHocvBqOLFy9aw6RlAoGAAhaydHFxUQ8PDxNiYmIGoI6MyWQyEiiIASozAUsq0Iqj5KFuWeExYFMzOMKMAFgtqMYUoNPs7e2HwVpvFA3v02FR0IaDwdFjgUajIYDC5HitRH11d3dTIiIiBtHGAZcxGlOlUhFh0QbApm+A4fXq7XNanD1dQjbGxob0Y4SMjt6FMzinoQ0lCYC1ov5n7WfUv/hFgIClArDH+KLMWmj4BP/htyey5E+4wv4z0PCJTvMXfcgr4G6BuxLdqIZNfPcPtyOqPcigIT4AAAAASUVORK5CYII=" },
                          skip = [],
                          extra = false,
                          processed = false,
                          rendered = false,
                          //loaded = false,
                          //jsonLoaded = false,
                          version = "2",
                          treatment = "2",
                          country = "us",
                          //cicon = "",
                          mraid_setup = false,
                          BAP = { options: {} },
                          mraid,
                          // mass shorteners
                          // 	this part is automated, see: cleaner.rb
                          // _w = window,
                          // _e = encodeURIComponent,
                          // _o = BAP.options,
                          // _n = null,
                          // _st = setTimeout,
                          // _pi = parseInt,
                          // _pf = parseFloat,
                          // _tech_ticker = (location.href.indexOf('tech-ticker') >= 0),
                          // _l = 'length'
                          // _d = document
                          // end shorteners
                          protocol = window.location.href.indexOf("http://") === 0 ? "http://" : "https://",
                          DOMAIN_ROOT = protocol + "dev.betrad.com",
                          MORE_INFO_ROOT = "https://info.evidon.com",
                          DOMAIN_JSON = DOMAIN_ROOT + "/a/",
                          ITUNES_LINK = "https://itunes.apple.com/us/app/appchoices/id894822870",
                          ANDROID_LINK = "https://play.google.com/store/apps/details?id=com.DAA.appchoices",
                          //INTERSTITIAL_LINK = MORE_INFO_ROOT + "/interstitial/",
                          body = document.getElementsByTagName("body")[0],
                          // error pixels -- this array exists to record a sent error pixel / nid for the purposes of not logging the same error twice
                          ep = {},
                          // iframes on the page and their associated ids
                          tangoPartners = {},
                          // coveredNotices is taken out of BAP.options for the cases when BAP.options notices are removed (iframe and transiotion cases)
                          coveredNotices = {},
                          iX = 0,
                          processTimeout,
                          uniqueids = [],
                          mq = [],
                          frameNoticed = {},
                          json = { queue: {} },
                          nids = {},
                          log = {},
                          //loadQueue = 0,
                          domain = document.domain,
                          _gdn,
                          browser = (function() {
                            var ua = navigator.userAgent,
                              isOpera = Object.prototype.toString.call(window.opera) === "[object Opera]",
                              safv = navigator.userAgent.substring(navigator.userAgent.indexOf("Version") + "Version".length + 1);
                            try {
                              safv = safv.substring(0, safv.indexOf(" "));
                            } catch (e) {}
                            return { IE: !!window.attachEvent && !isOpera, IE6: ua.indexOf("MSIE 6") > -1, IE7: ua.indexOf("MSIE 7") > -1, IE8: ua.indexOf("MSIE 8") > -1, Opera: isOpera, Gecko: ua.indexOf("Gecko") > -1 && ua.indexOf("KHTML") === -1, Safari: ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") <= -1, Chrome: !!navigator.userAgent.match("Chrome"), QuirksMode: document.compatMode === "BackCompat", SafariVersion: safv };
                          })(),
                          ifr = top.location !== location;

                        function start(options) {
                          var v,
                            i,
                            // s,
                            o = {},
                            bap_url,
                            pageId;
                          /**
                           * Special case that occurs when BAP.start has been called, but BAP has
                           * not loaded or unpacked yet. Specifically covers IE 6-9 for the cases
                           * when loading is still going. In this case, we push into _bab array
                           * every time that the error occurs during SURLY load. Afterwards, once
                           * BAP.start() has been called, we first check if there were unsuccessful
                           * previous attempts, and start them if there were.
                           */
                          try {
                            if (window._bab) {
                              v = window._bab;
                              window._bab = null;
                              for (i = v.length - 1; i >= 0; i--) {
                                start(v[i]);
                              }
                            }
                          } catch (e) {}
                          if (options) {
                            if (!options.uqid) {
                              return;
                            } else {
                              pageId = options.uqid;
                              if (BAP.options[pageId]) {
                                return;
                              }
                            }
                            // Convert properties to lower case since we have some odd clients...
                            try {
                              for (i in options) {
                                if (options.hasOwnProperty(i)) {
                                  o[i.toLowerCase()] = options[i];
                                }
                              }
                              options = o;
                            } catch (e) {}
                            if (options.ad_oas) {
                              try {
                                options.ad_oas = options.ad_oas.toLowerCase();
                                options.ad_wxh = options.ad_oas
                                  .replace("width=", "")
                                  .replace("height=", "")
                                  .replace(" ", "x");
                              } catch (e) {}
                            }
                            if (options.ad_wxh) {
                              try {
                                options.ad_wxh = options.ad_wxh.toLowerCase();
                                options.ad_w = options.ad_w || options.ad_wxh.split("x")[0];
                                options.ad_h = options.ad_h || options.ad_wxh.split("x")[1];
                              } catch (e) {}
                            }
                            if (!options.ad_w || !options.ad_h) {
                              error(options, 13);
                              return;
                            }
                            options.ns = getAdStandard(options.ad_h, options.ad_w);
                            /*
            if (options.ns === 0) {
                error(options, 14);
                return;
            }
            */
                            options.pixel_ad_w = options.ad_w;
                            options.pixel_ad_h = options.ad_h;
                            // Point of no errors, add into the processing queue
                            uniqueids.push(pageId);
                            BAP.options[pageId] = options;
                            if (!extra && ((options.check_container && options.check_container == "true") || /^(1525|4501|7420|8573)$/.test(options.nid))) {
                              i = document.createElement("script");
                              i.src = DOMAIN_ROOT + "/a/e.js";
                              body.appendChild(i);
                            }
                            // autodetect in_app option
                            if (!("in_app" in options) && options.autodetect_in_app === 1) {
                              var viewport_is_ad_size = options.ad_w + 10 > document.documentElement.clientWidth && document.documentElement.clientWidth > options.ad_w - 10 && options.ad_h + 5 > document.documentElement.clientHeight && document.documentElement.clientHeight > options.ad_h - 5;
                              BAP.options[pageId].in_app = (navigator.userAgent.match(/iPhone|iPad|iPod/) !== null && navigator.userAgent.indexOf("Safari") === -1) || (navigator.userAgent.indexOf("Android") !== -1 && viewport_is_ad_size) ? 1 : 0;
                            }
                            // link based on in_app
                            if (BAP.options[pageId].in_app !== 1 || BAP.options[pageId].vpaid === "true") {
                              if (BAP.options[pageId].coid === 321) {
                                // this is the override so OwnerIQ notices will go to their custom opt-out pages
                                BAP.options[pageId].link = "https://owneriq.evidon.com";
                              } else {
                                BAP.options[pageId].link = options.link || MORE_INFO_ROOT + "/more_info/" + options.nid;
                              }
                            } else {
                              BAP.options[pageId].link = "evidon://" + options.nid;
                              BAP.options[pageId].link += "/" + (options.appids || "");
                            }
                            bap_url = "n/" + options.coid + "/" + options.nid;
                            BAP.options[pageId].open = options.open || function(u) {
                                var opts = BAP.options[pageId];
                                // open link or overlay
                                if (opts.display_mobile_overlay && !(opts.ad_h < 50 || (opts.ad_h < 135 && opts.ad_w < 300))) {
                                  if (opts.overlayed) {
                                    gotoL3(pageId, u);
                                  } else {
                                    showOverlay(pageId, u);
                                  }
                                } else {
                                  if (opts.expanded) {
                                    gotoL3(pageId, u);
                                  } else {
                                    expandIcon(pageId);
                                  }
                                }
                              };
                            BAP.options[pageId].positionVertical = function() {
                              return this.position.indexOf("top") >= 0 ? "top" : "bottom";
                            };
                            BAP.options[pageId].positionHorizontal = function() {
                              return this.position.indexOf("left") >= 0 ? "left" : "right";
                            };
                            if (!nids[pageId]) {
                              nids[pageId] = BAP.options[pageId].nid = options.nid || null;
                            }
                            BAP.options[pageId].ad_h = parseInt(BAP.options[pageId].ad_h);
                            BAP.options[pageId].ad_w = parseInt(BAP.options[pageId].ad_w);
                            BAP.options[pageId].dm = -1;
                            coveredNotices[pageId] = {};
                            if (BAP.options[pageId].icon_display === "normal") {
                              BAP.options[pageId].micon = "mo_";
                            } else {
                              BAP.options[pageId].micon = "mi_";
                            }
                            BAP.options[pageId].miconWidth = 19;
                            if (BAP.options[pageId].ad_h === 36 && BAP.options[pageId].ad_w === 216) {
                              BAP.options[pageId].icon_display = "icon";
                              BAP.options[pageId].micon = "mi_12_";
                              BAP.options[pageId].miconWidth = 15;
                            }
                            BAP.options[pageId].ciconWidth = 77;
                            // if short length notice, overwrite length.
                            if (BAP.options[pageId].cicon === "_nl" || (!BAP.options[pageId].cicon && country === "nl")) {
                              BAP.options[pageId].ciconWidth = 47;
                            }
                            // if extended length notice, overwrite length and set to be expandable.
                            if (/_(de|es|nl_be|si|mt|lt|gr|ee|is|bg|tr|il|ar|hr|rs)$/.test(BAP.options[pageId].cicon) || (!BAP.options[pageId].cicon && /de|es|be|si|mt|lt|gr|cy|ee|is|bg|tr|il|sa|eg|hr|rs/.test(country))) {
                              BAP.options[pageId].icon_display = "expandable";
                              BAP.options[pageId].ciconWidth = 107;
                            }
                            // vendor specific icon display cases
                            // Invite Media
                            if (BAP.options[pageId].coid === 322 && /row|ru|cn|il|mx|tr|eg|sa|br|ar|tw|kr|jp/.test(country)) {
                              BAP.options[pageId].icon_display = "expandable";
                              BAP.options[pageId].icon_grayscale = "";
                              BAP.options[pageId].ciconWidth = 107;
                              BAP.options[pageId].cicon = "mo_";
                              //micon = "mi_";
                            }
                            if (bap_url) {
                              if (!json[options.nid]) {
                                //loadQueue++;
                                i = document.createElement("script");
                                i.src = DOMAIN_JSON + bap_url + ".js";
                                body.appendChild(i);
                              }
                            } else {
                              // remove whatever we pushed in
                              delete BAP.options[pageId];
                              error(options, 11);
                            }
                            // hide the pixel until needed.
                            try {
                              $("bap-pixel-" + pageId).style.display = "none";
                            } catch (e) {}
                          } else {
                            error(null, 10);
                          }
                          if (!json[BAP.options[pageId].nid]) {
                            json.queue[BAP.options[pageId].nid] = json.queue[BAP.options[pageId].nid] || [];
                            json.queue[BAP.options[pageId].nid].push(pageId);
                          } else {
                            process();
                          }
                          // trap when the onload doesn't fire. set to fire 5 seconds after.
                          if (processTimeout) {
                            clearTimeout(processTimeout);
                          }
                          processTimeout = setTimeout(process, 5000);
                        }
                        /**
                         * Used in cleaning up notices that became outdated or otherwise not needed.
                         */
                        function cleanup(pageId) {
                          try {
                            delete BAP.options[pageId];
                            var px = $("bap-pixel-" + pageId);
                            px.parentNode.removeChild(px);
                          } catch (e) {}
                        }

                        function process() {
                          function copyOverrides(pageId, key, j) {
                            for (j in window.bap_overrides[key]) {
                              // if this is a known option, override
                              if (BAP.options[pageId].hasOwnProperty(j)) {
                                BAP.options[pageId][j] = window.bap_overrides[key][j];
                              }
                            }
                          }
                          if (processed) {
                            return;
                          }
                          processed = true;
                          if (window.bap_skip) {
                            skip = skip.concat(window.bap_skip);
                          }
                          var i,
                            j,
                            s = false;
                          _gdn = !!($("abgc") && window.abgp);
                          try {
                            // Invite partners for a dance!
                            tango();
                            for (i = 0; i < uniqueids.length; i++) {
                              var pageId = uniqueids[i];
                              // skip if already processed
                              if (BAP.options[pageId].processed) {
                                continue;
                              }
                              // check the skip list, and pass if its in there
                              for (j = 0; j < skip.length; j++) {
                                if (skip[j] === BAP.options[pageId].nid || skip[j] === BAP.options[pageId].nid + "|" + pageId) {
                                  cleanup(pageId);
                                  s = true;
                                  break;
                                }
                                s = false;
                              }
                              if (s) {
                                continue;
                              }
                              // error check so see if this pageId's json is loaded
                              if (!json[BAP.options[pageId].nid]) {
                                error(BAP.options[pageId], 12);
                                cleanup(pageId);
                                continue;
                              } else {
                                // copy json into options
                                copyOptions(pageId, BAP.options[pageId].nid);
                              }
                              // if we have a global overrides object for notice options
                              if (window.bap_overrides && window.bap_overrides.hasOwnProperty(BAP.options[pageId].nid)) {
                                copyOverrides(pageId, BAP.options[pageId].nid);
                              }
                              // but sometimes, when a very special client shows up, this becomes a local overrider...
                              if (window.bap_overrides && window.bap_overrides.hasOwnProperty(BAP.options[pageId].nid + "|" + pageId)) {
                                copyOverrides(pageId, BAP.options[pageId].nid + "|" + pageId);
                              }
                              if (_gdn) {
                                // overwrite defaults.
                                BAP.options[pageId].position = "top-right";
                                BAP.options[pageId].icon_display = "expandable";
                                BAP.options[pageId].server = { name: "Google" };
                                BAP.options[pageId].ad_z = 9011;
                                $("abgc").style.display = "none";
                              }
                              // Determine notice detection mode
                              noticeMode(pageId);
                              // Exit conditions START
                              // TODO: wrap into a single method?
                              if (BAP.options[pageId].adi && !testWhitelist(pageId)) {
                                cleanup(pageId);
                                continue;
                              }
                              // Trustee is present and covers this ad.  Skipping.
                              if (BAP.options[pageId]._truste) {
                                cleanup(pageId);
                                continue;
                              }
                              if (BAP.options[pageId].ad && BAP.options[pageId].ad.style.display === "none") {
                                // OHMIGODNO, its hidden!
                                cleanup(pageId);
                                continue;
                              }
                              // Exit if provided container did not have a known ad standard applied to it
                              if (BAP.options[pageId].dm === 8 && !BAP.options[pageId].ad.ds) {
                                cleanup(pageId);
                                continue;
                              }
                              // Exit conditions END
                              showNoticeHelper(pageId);
                              BAP.options[pageId].processed = true;
                            }
                            // attaching resize event
                            BAP.vs = frameSize()[0] < body.scrollHeight;
                            iX = frameSize()[1];
                            addEvent(window, "resize", resize);
                            // movement detection
                            setIntervalWithFalloff(
                              function() {
                                testMs();
                                testResize();
                                testMovement();
                              }
                            );
                            // scroll detection
                            addEvent(window, "scroll", scroll);
                          } catch (e) {
                            BAPUtil.trace("[process() error]", e);
                          }
                          rendered = true;
                        }

                        function closeOverlay(pageId) {
                          var ol = document.getElementById("BAP-overlay-" + pageId);
                          if (ol !== null) ol.style.display = "none";
                          BAP.options[pageId].overlayed = false;
                          return false;
                        }

                        function showOverlay(pageId, l3url) {
                          var opts = BAP.options[pageId];
                          var ls = opts.ls || false;
                          if (!ls) {
                            action(pageId, "S");
                            opts.ls = true;
                          }
                          var overlay = document.getElementById("BAP-overlay-" + pageId);
                          if (overlay !== null) {
                            overlay.style.display = "block";
                          } else {
                            var olh = 135,
                              olw = 120;
                            if (opts.ad_h < 120 || opts.ad_w >= 300) {
                              olh = 50;
                              olw = 300;
                            }
                            var ih = opts.micon === "mi_12_" ? 12 : 15,
                              iw = opts.miconWidth,
                              pl = opts.posLeft,
                              pt = opts.posTop;
                            var t = opts.positionVertical() === "top" ? pt : pt + ih - olh;
                            var l = opts.positionHorizontal() === "right" ? pl + iw - olw : pl;
                            var l3link = "BAP.gotoL3('" + pageId + "', '" + l3url + "');",
                              posabs = "position: absolute;";
                            var ol = document.createElement("div");
                            ol.setAttribute("id", "BAP-overlay-" + pageId);
                            var styl = "position:absolute;";
                            styl += "height:" + (olh - 2) + "px; width:" + (olw - 2) + "px;"; // set h/w subtracting border
                            styl += "top: " + t + "px; left:" + l + "px;";
                            styl += "background: #fff; border: solid 1px black; font: bold 10px arial, helvetica;";
                            if (BAP.options[pageId].dm === 5) {
                              styl += "z-index: 100000;";
                            }
                            ol.setAttribute("style", styl);
                            // close
                            var cl = document.createElement("div");
                            cl.setAttribute("onclick", "return BAP.closeOverlay('" + pageId + "');");
                            cl.setAttribute("style", "font: bold 14px arial, helvetica; position: absolute; padding: 3px; cursor: pointer;");
                            cl.innerHTML = "X";
                            // trigger
                            // var iconCol = (BAP.options[pageId].icon === 'g' ? b64ig : b64i );
                            // var trig = document.createElement('img');
                            // trig.setAttribute("src", iconCol['mo_' + BAP.options[pageId].position]);
                            // trig.setAttribute('style', posabs);
                            // trig.setAttribute("onclick", l3link);
                            // overlay message and logo
                            var olm = document.createElement("div"),
                              oll = document.createElement("div");
                            olm.innerHTML = opts.mobile_message;
                            olm.setAttribute("onclick", l3link);
                            oll.setAttribute("onclick", l3link);
                            olm.setAttribute("style", posabs + "width:135px; padding:3px; word-wrap:break-word;");
                            oll.setAttribute("style", posabs + "width:115px; padding:1px;");
                            var img = document.createElement("img");
                            img.src = opts.adv_logo;
                            img.style.height = "45px";
                            img.style.width = "115px";
                            //img.setAttribute('style', 'margin:auto;');
                            oll.appendChild(img);
                            if (opts.positionVertical() === "top") {
                              // trig.style.top = cl.style.bottom = '0px';
                              olm.style.top = "15px";
                            } else {
                              // trig.style.bottom = cl.style.top = '0px';
                              olm.style.top = "15px";
                            }
                            if (opts.positionHorizontal() === "right") {
                              // trig.style.right = cl.style.left = '0px';
                            } else {
                              // trig.style.left = cl.style.right = '0px';
                            }
                            if (olw === 300) {
                              if (opts.positionHorizontal() === "right") {
                                oll.style.left = olm.style.right = "15px";
                              } else {
                                oll.style.right = "20px";
                              }
                            } else {
                              oll.style.top = "60px";
                              olm.style.width = "115px";
                            }
                            // ol.appendChild(trig);  TODO: remove if not needed by Q3 2015.
                            ol.appendChild(cl);
                            ol.appendChild(olm);
                            ol.appendChild(oll);
                            body.appendChild(ol);
                          }
                          opts.overlayed = true;
                        }

                        function isMobileChrome() {
                          // Chrome - crios
                          return navigator.userAgent.match(/crios/i) !== null;
                        }

                        function isMobileFirefox() {
                          // Firefox - fxios
                          return navigator.userAgent.match(/fxios/i) !== null;
                        }

                        function isMobileOpera() {
                          // Opera - opios
                          return navigator.userAgent.match(/opios/i) !== null;
                        }

                        function gotoL3(pageId, u) {
                          var opts = BAP.options[pageId],
                            targetLink;
                          var lm = opts.lm || false;
                          if (!lm) {
                            action(pageId, "M");
                            opts.lm = true;
                          }
                          if (opts.in_app === 1) {
                            // Android click
                            if (navigator.userAgent.indexOf("Android") > -1) {
                              // checking to see if the customer provided their own L3 link
                              targetLink = opts.custom_optout_url ? opts.custom_optout_url : ANDROID_LINK;
                              var iframe = document.createElement("iframe");
                              iframe.style.visibility = "hidden";
                              iframe.style.display = "none";
                              iframe.src = u;
                              document.body.appendChild(iframe);
                              setTimeout(function() {
                                if (typeof mraid !== "undefined" && mraid && mraid.getState() !== "loading") {
                                  mraid.open(targetLink);
                                } else {
                                  window.location = targetLink;
                                }
                              }, 200);
                              // iOS click
                            } else {
                              targetLink = opts.custom_optout_url ? opts.custom_optout_url : ITUNES_LINK;
                              var goToUrl = function(u) {
                                var link = document.createElement("a");
                                link.setAttribute("href", u);
                                link.setAttribute("target", "_blank");
                                var dispatch = document.createEvent("HTMLEvents");
                                dispatch.initEvent("click", true, true);
                                link.dispatchEvent(dispatch);
                              };
                              setTimeout(function() {
                                if (typeof mraid !== "undefined" && mraid && mraid.getState() !== "loading") {
                                  mraid.open(targetLink);
                                } else {
                                  goToUrl(targetLink);
                                  //window.location.href = targetLink;
                                }
                              }, 400);
                            }
                          } else {
                            // Mobile web click
                            // if we are running on an ios device we will only open the itunes link if we are running on safari.  If
                            // we are using mobile chrome, firefox, or opera we will open the url to the opt-out page.
                            if (navigator.userAgent.match(/iPhone|iPad|iPod/) !== null) {
                              if (isMobileChrome() || isMobileFirefox() || isMobileOpera()) {
                                window.open(u, "_newtab");
                              } else {
                                window.open(ITUNES_LINK, "_newtab");
                              }
                            } else {
                              window.open(u, "_newtab");
                            }
                          }
                        }

                        function copyOptions(pageId, nid) {
                          try {
                            var cud = json[nid].data;
                            // option defaults
                            BAP.options[pageId].rev = 0;
                            BAP.options[pageId].behavioral = BAP.options[pageId].behavioral || cud.behavioral || "definitive";
                            BAP.options[pageId].icon_delay = parseInt(BAP.options[pageId].icon_delay) || cud.icon_delay || 0;
                            BAP.options[pageId].icon_display = BAP.options[pageId].icon_display || cud.icon_display || "icon";
                            BAP.options[pageId].display_mobile_overlay = cud.display_mobile_overlay || false;
                            BAP.options[pageId].mobile_message = cud.mobile_message || "";
                            BAP.options[pageId].adv_logo = cud.adv_logo || null;
                            BAP.options[pageId].mobile_advertiser_logo_url = cud.mobile_advertiser_logo_url || null;
                            BAP.options[pageId].position = BAP.options[pageId].position || cud.icon_position || "top-right";
                            BAP.options[pageId].offsetTop = parseInt(BAP.options[pageId].offset_y) || cud.offset_y || 0;
                            BAP.options[pageId].offsetLeft = parseInt(BAP.options[pageId].offset_x) || cud.offset_x || 0;
                            BAP.options[pageId].icon = BAP.options[pageId].icon || "d";
                            BAP.options[pageId].container_opacity = cud.container_opacity || 100;
                            BAP.options[pageId].custom_optout_url = cud.mobile_in_app_url || null;
                          } catch (e) {
                            BAPUtil.trace("[copyOptions() error]", e);
                          }
                        }

                        function copyJSON(cud) {
                          try {
                            // jsonLoaded = true;
                            json[cud.data.nid] = cud;
                            if (BAP.processJSON) {
                              BAP.processJSON();
                            }
                            if (json.queue[cud.data.nid]) {
                              for (var i = 0; i < json.queue[cud.data.nid].length; i++) {
                                (function() {
                                  //var pageId = json.queue[cud.data.nid][i];
                                  if (document.readyState === "complete") {
                                    process();
                                  } else {
                                    addEvent(window, "load", process);
                                  }
                                })(i);
                              }
                            }
                          } catch (e) {
                            BAPUtil.trace("[copyJSON() error]", e);
                          }
                        }
                        /**
                         * DFA Whitelist tester
                         */
                        function testWhitelist(pageId) {
                          var f,
                            c,
                            i,
                            j,
                            el,
                            v = BAP.options[pageId].adi.split(",");
                          // DFA whitelist
                          try {
                            // if adi is passed, check if the doc location has it and stop processing for it, if it doesn't.
                            // iframe base: http://ad.doubleclick.net/adj/dmd.ehow/
                            if (BAP.options[pageId].dm === 5) {
                              for (i in v) {
                                if (document.location.href.indexOf("/" + v[i] + "/") > 0) {
                                  c = true;
                                  break;
                                }
                              }
                            } else {
                              // a different detection method is used, attempt DOM traversal.
                              f = BAP.options[pageId].ad.parentNode;
                              while (true) {
                                for (j = 0; j < f.children.length; j++) {
                                  el = f.children[j];
                                  if (el.src) {
                                    for (i in v) {
                                      if (el.src.indexOf("/" + v[i] + "/") > 0) {
                                        c = true;
                                        break;
                                      }
                                    }
                                  }
                                }
                                if (c) {
                                  break;
                                }
                                f = f.parentNode;
                                if (!f || !f.children) {
                                  break;
                                }
                              }
                            }
                          } catch (e) {}
                          return c;
                        }

                        function scroll() {
                          try {
                            testMovement();
                            // Fire again 100ms later; this fixes an issue where when you scroll back to the top of
                            // the page, the actual adunit doesn't finish moving right away so we end up with an
                            // incorrectly positioned notice. By firing again after a short delay, we should fix this.
                            setTimeout(testMovement, 100);
                          } catch (e) {
                            BAPUtil.trace("[scroll() error]", e);
                          }
                        }
                        /**
                         * Periodically calls function func.
                         * Calls it once after an initial delay (200 ms),
                         * then calls it every 100 ms for 10 seconds,
                         * then calls it every 5000 ms for 60 seconds.
                         */
                        function setIntervalWithFalloff(func) {
                          var i = 0,
                            repeater = function() {
                              try {
                                if (i === 0) {
                                  i++;
                                  setTimeout(repeater, 200);
                                } else {
                                  func();
                                  if (i < 100) {
                                    // reset timer @ 100 ms for the next 10 sec
                                    i++;
                                    setTimeout(repeater, 100);
                                  } else if (i < 112) {
                                    // 5 sec timer for the next 60 sec
                                    i++;
                                    if (i === 101) {
                                      BAPUtil.trace("[setIntervalWithFalloff] dropping timer to 5 sec");
                                    }
                                    setTimeout(repeater, 5000);
                                  } else {
                                    BAPUtil.trace("[setIntervalWithFalloff] dropping timer to 5 sec");
                                  }
                                }
                              } catch (e) {
                                BAPUtil.trace("[setIntervalWithFalloff error]", e);
                              }
                            };
                          return repeater();
                        }
                        /**
                         * Hides Microsoft Advertising / Atlas.
                         */
                        function testMs() {
                          var ms = window.__MicrosoftAdvertising,
                            msAd,
                            pageId;
                          if (ms && ms.Ad) {
                            for (pageId in BAP.options) {
                              if (BAP.options.hasOwnProperty(pageId) && !BAP.options[pageId]._ms) {
                                msAd = ms.Ad.getByPlacementId(BAP.options[pageId].atl_id) || ms.Ad.get(BAP.options[pageId].ad);
                                if (msAd) {
                                  msAd.removePlugin("AdChoices");
                                  BAP.options[pageId]._ms = true;
                                }
                              }
                            }
                          }
                        }

                        function testResize() {
                          var pageId;
                          for (pageId in BAP.options) {
                            if (!isNonTimerDm(BAP.options[pageId].dm)) {
                              noticePositionCalculate(pageId);
                              noticePosition(pageId);
                            }
                          }
                        }
                        /**
                         * This function detect if a Truste span is somewhere in the upwards path from the ad.
                         */
                        function testTruste(ad) {
                          if (!ad) {
                            return false;
                          }
                          var p = ad.parentNode;
                          while (true) {
                            if (!p) {
                              break;
                            }
                            try {
                              for (var i = 0; i < p.children.length; i++) {
                                var el = p.children[i];
                                if (el && el.id && el.id.indexOf("te-clearads") >= 0) {
                                  return true;
                                }
                              }
                            } catch (e) {}
                            p = p.parentNode;
                          }
                          return false;
                        }
                        /**
                         * Look for movement, of either the ad or pixel elements, after we've already
                         * rendered the notice.
                         *
                         * Dynamic content/AJAX widgets (like facebook connect) can fire several seconds after
                         * our notice has loaded, causing elements to shift position. This is meant to detect
                         * those movements.
                         *
                         * This function is triggered via setTimeout() and will slow down after 10sec and kill
                         * itself after about a minute.
                         */
                        function testMovement() {
                          var b, pEl, el, pageId;
                          for (pageId in BAP.options) {
                            b = BAP.options[pageId];
                            if (BAP.options[pageId].uqid) {
                              if (b.dm === 5) {
                                // skip iframes
                                return;
                              } else if (b.dm === 6) {
                                // use pixel element
                                el = b.px;
                              } else {
                                // use ad element
                                el = b.ad;
                              }
                              // Occurs when the notice becomes detached, example: DV or TRUSTe or iVillage via MediaMind
                              pEl = el;
                              if (!BAP.options[pageId].detached && pEl) {
                                while (true) {
                                  pEl = pEl.parentNode;
                                  if (pEl === body) {
                                    break;
                                  }
                                  if (pEl) {
                                    continue;
                                  } else {
                                    BAPUtil.trace("[testMovement()] Found a detached element");
                                    BAP.options[pageId].detached = true;
                                    break;
                                  }
                                }
                              } else {
                                // TODO: this is a part of noticeMode.  Maybe move it out?
                                pEl = proximityDetection(BAP.options[pageId].proximityId, BAP.options[pageId].ad_w, BAP.options[pageId].ad_h);
                                pEl = pickChildLevel(
                                  pEl,
                                  BAP.options[pageId].ad_h,
                                  BAP.options[pageId].ad_w
                                );
                                if (pEl) {
                                  BAP.options[pageId].ad = pEl;
                                }
                                BAP.options[pageId].detached = false;
                              }
                              try {
                                var p = _offset(el);
                                if (p.top !== b.pxt || p.left !== b.pxl) {
                                  // check current offset against stored values. if either differ, redraw!
                                  hidePopup(pageId);
                                  noticePositionCalculate(pageId);
                                  noticePosition(pageId);
                                }
                              } catch (e) {}
                            }
                          }
                        }
                        function resize() {
                          try {
                            var pageId,
                              dX = frameSize()[1] - iX,
                              vs = frameSize()[0] < body.scrollHeight,
                              vsToggle = BAP.vs !== vs;
                            if (dX !== 0 || vsToggle) {
                              for (pageId in BAP.options) {
                                if (BAP.options[pageId].uqid) {
                                  if (BAP.options[pageId].ad) {
                                    BAP.options[pageId].ad_w = parseInt(BAP.options[pageId].ad.style.width || BAP.options[pageId].ad.width || BAP.options[pageId].ad.offsetWidth);
                                    BAP.options[pageId].ad_h = parseInt(BAP.options[pageId].ad.style.height || BAP.options[pageId].ad.height || BAP.options[pageId].ad.offsetHeight);
                                  }
                                  noticePositionCalculate(pageId);
                                  noticePosition(pageId);
                                  if ($("bap-notice-" + pageId)) {
                                    hidePopup(pageId);
                                    // update L2 position
                                    updateL2(pageId);
                                  }
                                }
                              }
                              iX = frameSize()[1];
                              BAPUtil.trace("Resize event: X? " + (dX !== 0) + "|VS? " + vsToggle);
                            }
                            BAP.vs = vs;
                          } catch (e) {
                            BAPUtil.trace("[resize() error]", e);
                          }
                        }

                        function logIdString(options) {
                          return [encodeURIComponent(options.aid || 0), encodeURIComponent(options.icaid || 0), encodeURIComponent(options.ecaid || 0)
                                .replace(/_/g, "$underscore$")
                                .replace(/%2F/g, "$fs$"), encodeURIComponent(options.nid || 0)].join("_") + "/";
                        }

                        function actionWrite(options, l, ow) {
                          dropPixel(protocol + "l.betrad.com/ct/" + logIdString(options) + [country, l, options.pixel_ad_w, options.pixel_ad_h, 242, options.coid, options.rev].join("/") + "/" + "pixel.gif?v=" + version + "m_" + SCRIPT_VERSION + "&ttid=" + treatment + "&d=" + domain + ow + "&mb=" + (options.in_app === 1 ? "1" : "2") + "&r=" + Math.random());
                        }

                        function dropPixel(u) {
                          var img = new Image(0, 0);
                          img.src = u;
                          img.style.display = "none";
                          body.appendChild(img);
                        }

                        function action(pageId, state) {
                          /* NON_PROD */
                          if (!logging) {
                            return;
                          }
                          var l,
                            key,
                            ow = "",
                            lo = log[pageId],
                            sw = false;
                          /*
        	T -- tag loaded; (this setting is no longer called)
        	I -- icon (L1) shown;
        	S -- notice (L2) shown;
        	A -- advertiser clicked;
        	B -- IAB clicked;
        	M -- more info;
        	O -- dynamic inclusion overwrite;
        */
                          BAPUtil.trace("Logging action: " + state + " for " + pageId);
                          if (!lo) {
                            lo = { T: [0, "1/0/0/0/0/0"], I: [0, "0/1/0/0/0/0"], S: [0, "0/0/1/0/0/0"], A: [0, "0/0/0/1/0/0"], B: [0, "0/0/0/0/1/0"], M: [0, "0/0/0/0/0/1"], O: [0, "0/1/0/0/0/0"] };
                          }
                          if (lo[state][0] === 0) {
                            lo[state][0] = 1;
                            l = lo[state][1];
                            sw = true;
                          }
                          // shortcutting overwrite stateflag
                          state === "O" && (ow = "&o=1");
                          log[pageId] = lo;
                          if (!sw) {
                            return;
                          }
                          actionWrite(BAP.options[pageId], l, ow);
                          // check if this notice overwrites others, and in the case of M and B, fire a logging pixel as well
                          if (!BAP.options[pageId].noticeExists && coveredNotices[pageId] && (state === "B" || state === "M")) {
                            ow = "&o=1";
                            for (key in coveredNotices[pageId]) {
                              actionWrite(coveredNotices[pageId][key], l, ow);
                            }
                          }
                        }

                        function error(options, ec) {
                          /* NON_PROD */
                          if (detection === "tagui") {
                            return;
                          }
                          /*
        	Error Codes:
        	- 10 -- options missing
        	- 11 -- invalid options (pre json load)
        	- 12 -- json is not loaded
        	- 13 -- ad height or ad width is missing
        	- 14 -- height and width map to an invalid ad standard
        	- 100 -- noscript served
        */
                          var pixel = logIdString(options);
                          var inApp = options.in_app && options.in_app === 1 ? "1" : "2";
                          //var adSrc = options.ad_src ? options.ad_src : "";
                          if (ep[pixel] !== ec) {
                            ep[pixel] = ec;
                            if (pixel) {
                              dropPixel(protocol + "l.betrad.com/ct/" + pixel + "pixel.gif?e=" + ec + "&v=" + version + "m_" + SCRIPT_VERSION + "&d=" + domain + inApp + "&r=" + Math.random());
                            }
                          }
                        }

                        function expandIcon(pageId) {
                          if (BAP.options[pageId].expanded) {
                            return;
                          }
                          var iconCol = BAP.options[pageId].icon === "g" ? b64ig : b64i;
                          var icon = '<img src="' + iconCol["mo_" + BAP.options[pageId].position] + '">',
                            trigger = $("trigger-" + pageId),
                            currLeft = _offset(trigger).left;
                          if (BAP.options[pageId].positionHorizontal() === "right") {
                            currLeft = currLeft + BAP.options[pageId].miconWidth - BAP.options[pageId].ciconWidth;
                          }
                          trigger.style.left = currLeft + "px";
                          trigger.innerHTML = icon;
                          BAP.options[pageId].expanded = true;
                          BAP.options[pageId].posLeft = currLeft;
                        }

                        function collapseIcon(pageId) {
                          var trigger, currLeft;
                          if (!BAP.options[pageId].expanded) {
                            return;
                          }
                          var iconCol = BAP.options[pageId].icon === "g" ? b64ig : b64i;
                          var icon = '<img src="' + iconCol[BAP.options[pageId].micon + BAP.options[pageId].position] + '">';
                          (trigger = $("trigger-" + pageId)), (currLeft = _offset(trigger).left);
                          if (BAP.options[pageId].positionHorizontal() === "right") {
                            currLeft = currLeft + BAP.options[pageId].ciconWidth - BAP.options[pageId].miconWidth;
                          }
                          trigger.style.left = currLeft + "px";
                          trigger.innerHTML = icon;
                          BAP.options[pageId].expanded = false;
                        }

                        function getDims(el) {
                          try {
                            var eh = el.height,
                              ew = el.width;
                            if (!eh) {
                              eh = parseInt(getStyle(el, "height"));
                            }
                            if (!ew) {
                              ew = parseInt(getStyle(el, "width"));
                            }
                            if (!eh) {
                              eh = el.offsetHeight;
                            }
                            if (!ew) {
                              ew = el.offsetWidth;
                            }
                            return [ew, eh];
                          } catch (e) {}
                          return false;
                        }

                        function checkElement(el, height, width) {
                          try {
                            var eh = getDims(el)[1],
                              ew = getDims(el)[0];
                            if (eh === height && ew === width) {
                              return true;
                            }
                            // adding 10 pixel margin autoadjust
                            if (eh <= height + 5 && eh >= height - 5 && ew >= width - 5 && ew <= width + 5) {
                              return true;
                            }
                          } catch (e) {}
                          return false;
                        }

                        function getObjectEmbed(ad) {
                          // Short circuit for Safari since it never used <embed>
                          if (browser.Safari && browser.SafariVersion.indexOf("5.1") < 0) {
                            return ad;
                          }
                          var em, io, elx, embed;
                          try {
                            if (ad.nodeName.toLowerCase() === "object") {
                              for (elx = ad.childNodes.length - 1; elx > 0; elx--) {
                                embed = ad.childNodes[elx];
                                if (embed.nodeName.toLowerCase() === "embed") {
                                  em = embed;
                                  break;
                                }
                                if (embed.nodeName.toLowerCase() === "object" && embed.type === "application/x-shockwave-flash") {
                                  io = embed;
                                }
                              }
                            }
                            if (!em && io) {
                              em = io;
                            }
                            if (browser.Gecko && em) {
                              return em;
                            }
                            // Embed happens to be preferred but if dims are 0s, reuse original ad.
                            if (em.offsetHeight === 0 && em.offsetWidth === 0) {
                              return ad;
                            }
                            if (browser.Chrome && em) {
                              ad = em;
                            } else if (_offset(em).top !== 0) {
                              ad = em;
                            }
                          } catch (e) {}
                          return ad;
                        }

                        function checkSiblings(ob, spotHeight, spotWidth, level) {
                          try {
                            if (level === 15 || !ob) {
                              return false;
                            } else {
                              if (nodeAcceptCheck(ob) && checkElement(ob, spotHeight, spotWidth)) {
                                return ob;
                              } else {
                                //if (ob.previousSibling)
                                return checkSiblings(ob.previousSibling, spotHeight, spotWidth, ++level);
                              }
                            }
                          } catch (e) {
                            return false;
                          }
                        }

                        function nodeAcceptCheck(el) {
                          return /DIV|IMG|EMBED|OBJECT|IFRAME|CANVAS|VIDEO|svg|ARTICLE|MAIN|ASIDE|FIGURE|NAV|SECTION/.test(el.nodeName);
                        }
                        function nodeIsContainer(el) {
                          return /DIV|ARTICLE|MAIN|ASIDE|FIGURE|NAV|SECTION/.test(
                            el.nodeName
                          );
                        }

                        function checkChildren(ob, spotHeight, spotWidth) {
                          try {
                            if (!ob) {
                              return false;
                            } else {
                              var _ = ob.children || ob.childNodes,
                                q,
                                o;
                              if (_.length === 0) {
                                return false;
                              }
                              for (o = 0; o < _.length; o++) {
                                // validate the element
                                if (!isValidElement(_[o])) {
                                  continue;
                                }
                                if (checkElement(_[o], spotHeight, spotWidth) && nodeIsContainer(_[o])) {
                                  return _[o];
                                  /*jsl:ignore*/
                                } else if ((q = checkChildren(_[o], spotHeight, spotWidth)) && nodeIsContainer(_[o]) ) {
                                  /*jsl:end*/
                                  return q;
                                }
                              }
                            }
                          } catch (e) {
                            return false;
                          }
                        }
                        function pickChildLevel(el, h, w) {
                          var a = el;
                          while (true) {
                            a = checkChildren(a, h, w);
                            if (!a) {
                              break;
                            } else if (a.nodeName === "EMBED") {
                              if (a.parentNode.nodeName === "OBJECT") {
                                el = getObjectEmbed(a.parentNode);
                                break;
                              } else {
                                el = a;
                              }
                            } else {
                              if (a.nodeName === "OBJECT") {
                                ad2 = getObjectEmbed(a);
                              }
                              el = a;
                            }
                          }
                          return el;
                        }
                        function hidePopup(pageId) {
                          try {
                            var popup = $("bap-notice-" + pageId);
                            if (popup && getStyle(popup, "display") !== "none") {
                              popup.style.display = "none";
                            }
                          } catch (e) {}
                        }

                        function toggle(el) {
                          if (!el.id) {
                            el = $("bap-notice-" + el);
                          }
                          if (getStyle(el, "display") !== "none") {
                            el.style.display = "none";
                          } else {
                            el.style.display = "block";
                          }
                        }

                        function $() {
                          var i,
                            elements = [];
                          for (i = 0; i < arguments.length; i++) {
                            var element = arguments[i];
                            if (typeof element === "string") {
                              element = document.getElementById(element);
                            }
                            if (arguments.length === 1) {
                              return element;
                            }
                            elements.push(element);
                          }
                          return elements;
                        }

                        function addEvent(elm, evType, fn, useCapture) {
                          if (elm.addEventListener) {
                            elm.addEventListener(evType, fn, useCapture || false);
                            return true;
                          } else if (elm.attachEvent) {
                            return elm.attachEvent("on" + evType, fn);
                          } else {
                            elm["on" + evType] = fn;
                          }
                        }

                        function frameSize() {
                          var w = window,
                            width = -1,
                            height = -1;
                          try {
                            if (typeof w.innerWidth === "number") {
                              width = w.innerWidth;
                            } else {
                              if (w.document.documentElement && w.document.documentElement.clientWidth) {
                                width = w.document.documentElement.clientWidth;
                              } else {
                                if (body && body.clientWidth) {
                                  width = body.clientWidth;
                                }
                              }
                            }
                          } catch (err) {}
                          try {
                            if (typeof w.innerWidth === "number") {
                              height = w.innerHeight;
                            } else {
                              if (w.document.documentElement && w.document.documentElement.clientHeight) {
                                height = w.document.documentElement.clientHeight;
                              } else {
                                if (body && body.clientHeight) {
                                  height = body.clientHeight;
                                }
                              }
                            }
                          } catch (err) {}
                          return [height, width];
                        }

                        function getStyle(el, styleProp) {
                          try {
                            var y;
                            if (el.currentStyle) {
                              y = el.currentStyle[styleProp];
                            } else if (window.getComputedStyle) {
                              y = document.defaultView
                                .getComputedStyle(
                                  el,
                                  null
                                )
                                .getPropertyValue(
                                  styleProp
                                );
                            }
                            if (!y && styleProp === "text-align") {
                              try {
                                y = el.currentStyle.textAlign;
                              } catch (e) {}
                            }
                            return y;
                          } catch (e) {
                            return null;
                          }
                        }

                        function getDepth(el) {
                          var z = browser.IE ? "zIndex" : "z-index",
                            zi = null;
                          if (el === null) {
                            return;
                          }
                          if (getStyle(el, z) === "auto") {
                            zi = getDepth(el.parentNode);
                          } else if (parseInt(getStyle(el, z)) > 0) {
                            zi = getStyle(el, z);
                          }
                          return parseInt(zi) + 10;
                        }
                        /**
                         * This identifies supported ad standards. When addint entry here, make sure that cratePopup
                         * is updated.
                         */
                        function getAdStandard(height, width) {
                          var i,
                            s = sizes;
                          for (i = 0; i < s.length; i++) {
                            if (s[i].w === width && s[i].h === height) {
                              return s[i].i;
                            }
                          }
                          return 0;
                        }

                        function sizeMatch(adw, adh) {
                          var i,
                            lastMatch = null,
                            imgs = document.getElementsByTagName("img");
                          for (i = 0; i < imgs.length; i++) {
                            if (!imgs[i].height && !imgs[i].getAttribute("height")) {
                              continue;
                            }
                            if (!imgs[i].width && !imgs[i].getAttribute("width")) {
                              continue;
                            }
                            if (imgs[i].height === adh && imgs[i].width === adw) {
                              lastMatch = imgs[i];
                            } else if (parseInt(imgs[i].getAttribute("height")) === adh && parseInt(imgs[i].getAttribute("width")) === adw) {
                              lastMatch = imgs[i];
                            }
                          }
                          return lastMatch;
                        }

                        function proximityDetection(pxId, spotWidth, spotHeight, px) {
                          var i,
                            d,
                            w,
                            h,
                            img,
                            key,
                            rent,
                            cm = null,
                            matches = {},
                            dist = null,
                            everything = document.getElementsByTagName("*");
                          for (i = 0; i < everything.length; i++) {
                            if (nodeAcceptCheck(everything[i])) {
                              img = everything[i];
                              // skip EMBED if its parent is a proper OBJECT.
                              if (img.nodeName === "EMBED" && img.parentNode.nodeName === "OBJECT") {
                                continue;
                              }
                              if (!img.height && !img.getAttribute("height") && !getStyle(img, "height")) {
                                break;
                              }
                              if (!img.width && !img.getAttribute("width") && !getStyle(img, "width")) {
                                break;
                              }
                              if (img.height === spotHeight && img.width === spotWidth) {
                                matches[i] = img;
                              } else if (parseInt(img.getAttribute("height")) === spotHeight && parseInt(img.getAttribute("width")) === spotWidth) {
                                matches[i] = img;
                              } else {
                                // CSS reparsing.
                                try {
                                  w = parseInt(getStyle(img, "width").replace("px", ""));
                                  h = parseInt(getStyle(img, "height").replace("px", ""));
                                  if (h === spotHeight && w === spotWidth) {
                                    matches[i] = img;
                                  }
                                } catch (e) {}
                              }
                            }
                          }
                          for (key in matches) {
                            d = Math.abs(pxId - key);
                            //if (d > 50) { continue; }
                            if (dist === null || d < dist) {
                              dist = d;
                              cm = matches[key];
                            }
                            if (px && px.parentNode === matches[key].parentNode) {
                              rent = { d: d, cm: matches[key] };
                            }
                          }
                          // compare same daddy match.
                          if (rent && Math.abs(dist - rent.d) < 5) {
                            // preferring same daddy!
                            cm = rent.cm;
                          }
                          matches = null;
                          try {
                            if (cm && cm.nodeName === "OBJECT") {
                              cm = getObjectEmbed(cm);
                            }
                          } catch (e) {}
                          return cm;
                        }

                        function addNoticeDelay(pageId) {
                          action(pageId, "I");
                          if (BAP.options[pageId].icon_delay > 0) {
                            var trigger = $("trigger-container-" + pageId);
                            trigger.style.display = "none";
                            // Error in this function would occur because of the out of sync requests from other dancers around
                            setTimeout(function() {
                              try {
                                $("trigger-container-" + pageId).style.display = "block";
                              } catch (e) {}
                            }, parseInt(BAP.options[pageId].icon_delay) * 1000);
                            BAPUtil.trace("Adding notice delay to the following notice: " + pageId + " delay:" + BAP.options[pageId].icon_delay + " seconds");
                          }
                        }
                        /**
                         * This method positions the notice.
                         */
                        function noticePosition(pageId) {
                          if (!isNonTimerDm(BAP.options[pageId].dm)) {
                            var t = $("trigger-" + pageId);
                            t.style.top = BAP.options[pageId].posTop + "px";
                            t.style.left = BAP.options[pageId].posLeft + "px";
                          }
                        }

                        function isNonTimerDm(_dm){
                          if (_dm === 3 || _dm === 9 || _dm === 5){
                            return true;
                          } else {
                            return false;
                          }
                        }
                        /**
                         * This method calculates new notice location points based on the mode
                         * that the notice is in.
                         */

                        /*
      posLeft =  x postion of the icon
      posTop =  y postion of the icon
      spotWidth = width of ad
      spotHeight = height of ad
      spotLeft  =  x postion of the ad
      spotTop  =  y postion of the ad
      pixelLeft =  x postion of the pixel dropped by durly (4.gif)
      pixelTop  =  y postion of the pixel dropped by durly (4.gif)
      */
                        function noticePositionCalculate(pageId) {
                          var posTop,
                            posLeft,
                            pixLeft,
                            pixTop,
                            //lof = 2,
                            ad = BAP.options[pageId].ad,
                            spotHeight = BAP.options[pageId].ad_h,
                            spotWidth = BAP.options[pageId].ad_w,
                            spotLeft,
                            spotTop,
                            ew,
                            px,
                            box;
                          if (BAP.options[pageId].expanded) {
                            console.log("is expanded");
                          }
                          if (BAP.options[pageId].dm === 5) {
                            spotHeight = BAP.options[pageId].ad_h;
                            spotWidth = BAP.options[pageId].ad_w;
                            pixLeft = spotLeft = spotTop = pixTop = 0;
                          } else if (BAP.options[pageId].dm === 3) {
                            spotHeight = BAP.options[pageId].ad.parentElement.parentElement.getBoundingClientRect().height;
                            spotWidth = BAP.options[pageId].ad.parentElement.parentElement.getBoundingClientRect().width;
                            pixLeft = _offset(ad).left;
                            pixTop = _offset(ad).top;
                            spotLeft = pixLeft;
                            spotTop = pixTop;
                          } else if (BAP.options[pageId].dm === 1 || BAP.options[pageId].dm === 2 || BAP.options[pageId].dm === 3 || BAP.options[pageId].dm === 4 || BAP.options[pageId].dm === 4.1 || BAP.options[pageId].dm === 4.2 || BAP.options[pageId].dm === 5 || BAP.options[pageId].dm === 7 || BAP.options[pageId].dm === 8) {
                            pixLeft = _offset(ad).left;
                            pixTop = _offset(ad).top;
                            spotLeft = pixLeft;
                            spotTop = pixTop;
                          } else if (BAP.options[pageId].dm === 6) {
                            px = BAP.options[pageId].px;
                            pixLeft = _offset(px).left;
                            pixTop = _offset(px).top;
                            if (browser.Opera) {
                              // Opera styling bug?  Top/Bottom is set to 0 when element height and width is 0
                              // resize the pixel to be visible, measure top and hide it again
                              px.width = px.height = "1";
                              pixTop = _offset(px).top;
                              px.width = px.height = "0";
                            }

                            spotWidth = BAP.options[pageId].px.parentElement.clientWidth;
                            spotHeight = BAP.options[pageId].px.parentElement.clientHeight;

                            spotLeft = pixLeft - spotWidth;
                            spotTop = pixTop;
                            var bumpDown = 4;
                            // adjust when pixel is not in the required position
                            try {
                              ew = px.parentNode.width;
                              if (!ew) {
                                ew = parseInt(getStyle(px.parentNode, "width"));
                              }
                              if (ew <= spotWidth) {
                                spotLeft = spotLeft + spotWidth;
                                if (getStyle(px, "text-align")
                                    .toLowerCase()
                                    .indexOf("center") >= 0) {
                                  spotLeft = spotLeft - spotWidth / 2;
                                  if (browser.IE) {
                                    spotTop -= bumpDown;
                                  }
                                } else if (getStyle(px, "text-align")
                                    .toLowerCase()
                                    .indexOf("right") >= 0) {
                                  spotLeft = spotLeft - spotWidth;
                                  if (browser.IE) {
                                    spotTop -= bumpDown;
                                  }
                                }
                              }
                            } catch (e) {}
                          }
                          // if body is relative or has some padding / margin limits, adjust left position for them.
                          try {
                            if (getStyle(body, "position") === "relative") {
                              box = body.getBoundingClientRect();
                              spotLeft = spotLeft - box.left;
                            }
                          } catch (e) {}
                          // calculating icon position within the located object according to the selected notice corner

                          posTop = spotTop;
                          posLeft = spotLeft;
                          var iconH = 14;

                          if (BAP.options[pageId].position === "top-right") {
                            posLeft = spotLeft + spotWidth;
                          } else if (BAP.options[pageId].position === "bottom-right") {
                            posTop += spotHeight - iconH;
                            posLeft += spotWidth;
                          } else if (BAP.options[pageId].position === "bottom-left") {
                            posTop += spotHeight - iconH;
                          }
                          // adjust with offsets
                          posTop += BAP.options[pageId].offsetTop;
                          posLeft += BAP.options[pageId].offsetLeft;
                          // final adjusting using specification in use
                          // posTop =
                          //   posTop + (BAP.options[pageId].positionVertical() === "top" ? 0 : -1);

                          if (BAP.options[pageId].expanded && BAP.options[pageId].positionHorizontal() === "right") {
                            posLeft -= BAP.options[pageId].ciconWidth;
                          } else if (BAP.options[pageId].positionHorizontal() === "right") {
                            posLeft -= BAP.options[pageId].miconWidth;
                          }

                          BAP.options[pageId].pxl = pixLeft;
                          BAP.options[pageId].pxt = pixTop;
                          BAP.options[pageId].posTop = posTop;
                          BAP.options[pageId].posLeft = posLeft;
                          BAP.options[pageId].ad_h = spotHeight;
                          BAP.options[pageId].spotTop = spotTop;
                          BAP.options[pageId].spotLeft = spotLeft;
                          BAP.options[pageId].ad_w = spotWidth;
                        }
                        /**
                         * This method figures out the case of the notice display.
                         */
                        function noticeMode(pageId) {
                          var ad,
                            dm,
                            spotHeight = BAP.options[pageId].ad_h,
                            spotWidth = BAP.options[pageId].ad_w,
                            px = $("bap-pixel-" + pageId),
                            everything = document.getElementsByTagName("*");
                          // find proximityId
                          for (dm = 0; dm < everything.length; dm++) {
                            if (px === everything[dm]) {
                              BAP.options[pageId].proximityId = dm;
                            }
                          }
                          if (ifr && (frameSize()[0] === spotHeight && frameSize()[1] === spotWidth)) {
                            // iframe case - easiest one!
                            dm = 5;
                          } else if (checkElement($("flash_creative"), spotHeight, spotWidth) && detection === "tagui") {
                            /* NON_PROD */
                            // special case for TAG UI
                            /* NON_PROD */
                            ad = $("flash_creative");
                            /* NON_PROD */
                            dm = 4;
                          } else if (domain.indexOf("mail.yahoo.com") > 0 && document.getElementsByTagName("object").length === 1 && browser.IE) {
                            // special case for Yahoo Mail
                            ad = document.getElementsByTagName("object")[0];
                            dm = 4.1;
                          } else if (BAP.options[pageId].container && (ad = $(BAP.options[pageId].container))) {
                            if (BAP.options[pageId].check_container) {
                              ad = checkChildren(ad, spotHeight, spotWidth) || ad;
                              // Overwriting dimensions.
                              if (ad.ds) {
                                BAP.options[pageId].ad_h = ad.offsetHeight;
                                BAP.options[pageId].ad_w = ad.offsetWidth;
                                BAP.options[pageId].pixel_ad_w = BAP.options[pageId].ad_w;
                                BAP.options[pageId].pixel_ad_h = BAP.options[pageId].ad_h;
                                BAP.options[pageId].ns = ad.ds;
                              }
                            } else {
                              // set passed in ad standard if were not checking the container
                              ad.ds = BAP.options[pageId].ns;
                            }
                            // native container
                            dm = 8;
                          } else {
                            // check previous siblings
                            ad = checkSiblings(px.previousSibling, spotHeight, spotWidth, 1);
                            if (ad) {
                              // detected previous sibling that qualifies as ad
                              dm = 3;
                            } else if (domain.indexOf("yahoo.com") > 0 && (ad = sizeMatch(spotWidth, spotHeight))) {
                              // Size Matcher for VENDOR CASE (yahoo)
                              dm = 4.2;
                            } else if ((ad = proximityDetection(BAP.options[pageId].proximityId, spotWidth, spotHeight, px))) {
                              // proximity detector
                              dm = 7;
                            } else {
                              // pixel aft based detection, unhide the pixel
                              dm = 6;
                              try {
                                $("bap-pixel-" + pageId).style.display = "";
                              } catch (e) {}
                            }
                          }
                          // Check for truste stuff in the path of this notice.
                          BAP.options[pageId]._truste = testTruste(ad);
                          if (dm === 3) {
                            // validate if the level of notice is correct by looking into children
                            ad = pickChildLevel(ad, spotHeight, spotWidth);
                          }
                          BAP.options[pageId].dm = dm;
                          BAP.options[pageId].ad = ad;
                          BAP.options[pageId].px = px;
                          //var page_src;

                          function find_child_src(elm) {
                            if (elm) {
                              if (elm.src) {
                                return elm.src;
                              } else {
                                var _ = elm.children || elm.childNodes,
                                  //q,
                                  o;
                                if (_.length === 0) {
                                  return false;
                                }
                                for (o = 0; o < _.length; o++) {
                                  var src = find_child_src(_[o]);
                                  if (src) {
                                    return src;
                                  }
                                }
                              }
                            }
                            return false;
                          }
                          var ad_src = find_child_src(ad);
                          BAP.options[pageId].ad_src = !ad_src ? "undefined" : /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i.exec(ad_src)[1];
                          /**
                           * Added in response to eyeWonder dynamic ads that keep setting higher depth setting
                           * then our default 10k. Or default is currently set at 9990 for L1 an 9991 for L2.
                           * It will be overwritten by this setting if there is a need to set it.
                           */
                          try {
                            BAP.options[pageId].ad_z = BAP.options[pageId].ad_z || getDepth(ad);
                          } catch (e) {}
                          /**
                           * Added for the case when detection is not executed within an iframe,
                           * but the frame contents are also set pretty high up in the depth index
                           */
                          if (dm === 5) {
                            BAP.options[pageId].ad_z = 100000;
                          }
                          /**
                           * Adding removal of anchor pixel.  If the mode is not pixel based, pixel
                           * may break the layout, especially if it has been injected prior to the ad.
                           */
                          if (dm !== 6) {
                            px.parentNode.removeChild(px);
                          }
                        }
                        /**
                         * This method checks if the notice has been given already.
                         */
                        function noticeVerification(pageId) {
                          var ad = BAP.options[pageId].ad;
                          // check if notice already given for the ad in question
                          if (ad && !ad.notice) {
                            ad.notice = pageId;
                          } else if (ad && ad.notice !== pageId) {
                            // notice already given for this element
                            BAP.options[pageId].noticeExists = true;
                            if (nids[ad.notice] !== nids[pageId]) {
                              coverNotice(ad.notice, pageId);
                            }
                          } else if (BAP.options[pageId].dm === 5) {
                            if (window.notice) {
                              // notice already given for this frame (case of 2+ script notices within a frame)
                              BAP.options[pageId].noticeExists = true;
                              if (nids[window.notice] !== nids[pageId]) {
                                coverNotice(window.notice, pageId);
                              }
                            } else {
                              // iframe case with exact match
                              // marking the frame as covered by first notice
                              window.notice = pageId;
                              BAP.options[pageId].ad = { nodeName: "EXACT-FRAME" };
                              // already received a ping, send the BAPFRAME.
                              if (window.bap_frameid) {
                                postNoticeMessage("BAPFRAME|" + nids[pageId] + "|" + window.bap_frameid);
                                BAPUtil.trace("Posted frame coverage message: " + pageId + " (" + nids[pageId] + ")");
                              } else {
                                // check if the iframe and top are the same.  If not, broadcast to the top.
                                if (window.parent !== window.top) {
                                  BAPUtil.trace("Broadcasting frame coverage message: " + pageId + " (" + nids[pageId] + ")");
                                  window.top.postMessage("BAPFRAMEBROADCAST|" + nids[pageId] + "|" + (document.referrer ? document.referrer : "") + "|" + BAP.options[pageId].ad_w + "|" + BAP.options[pageId].ad_h, "*");
                                } else {
                                  BAPUtil.trace("Ohh no, all by myself! Anyone up there wonna Rhumba?!?");
                                  window.top.postMessage("BAPFRAMEID|" + nids[pageId] + "|" + document.location.href, "*");
                                }
                              }
                            }
                          }
                          if (BAP.options[pageId].ad && !BAP.options[pageId].noticeExists) {
                            if (BAP.options[pageId].ad.nodeName === "IFRAME" && BAP.options[pageId].ad.src in frameNoticed) {
                              // notice already given for this element
                              BAP.options[pageId].noticeExists = true;
                            } else if (BAP.options[pageId].ad.nodeName === "EXACT-FRAME" && frameNoticed.contents) {
                              // notice already given for this element: CASE FRAME-PASS
                              BAP.options[pageId].noticeExists = true;
                            }
                          }
                        }
                        /**
                         * This method places the actual <div> and other visual elements on the page.
                         */
                        function noticeCreate(pageId) {
                          var icon,
                            //iconWidth,
                            iconCol,
                            opacity,
                            z = "",
                            expansion = "",
                            div = $("BAP-holder"),
                            click = "";
                          if (!div) {
                            div = document.createElement("div");
                            div.setAttribute("id", "BAP-holder");
                            body.appendChild(div);
                          }
                          try {
                            opacity = parseInt(BAP.options[pageId].container_opacity) / 100;
                          } catch (e) {
                            opacity = 1;
                          }
                          opacity = opacity < 1 ? "opacity:" + opacity + ";-moz-opacity:" + opacity + ";-ms-filter:DXImageTransform.Microsoft.Alpha(Opacity=" + opacity * 100 + ");filter:alpha(opacity=" + opacity * 100 + ");" : "";
                          iconCol = BAP.options[pageId].icon === "g" ? b64ig : b64i;
                          icon = '<img src="' + iconCol[BAP.options[pageId].micon + BAP.options[pageId].position] + '">';
                          //iconWidth = BAP.options[pageId].miconWidth;
                          click = "BAP.options['" + /* NO_CLEANUP */ pageId + "'].open('" + BAP.options[pageId].link + "', '_newtab');"; //'BAP.action(\'' + pageId + '\', \'S\'); BAP.action(\'' + pageId + '\', \'M\'); ' +
                          if (BAP.options[pageId].ad_z) {
                            z = "z-index:" + parseInt(BAP.options[pageId].ad_z) + ";";
                          }
                          icon = '<span id="trigger-' + pageId + '" style="' + z + "position:absolute; " + opacity + '" class="bap-trigger" onclick="' + click + '"' + expansion + ">" + icon + "</span>";
                          icon = '<div id="trigger-container-' + pageId + '" style="position: static !important;">' + icon + "</div>";
                          if (typeof mraid !== "undefined" && mraid && !mraid_setup) {
                            mraid_setup = true;
                            if (mraid.getState() === "loading") {
                              mraid.addEventListener("ready", mraidSetup);
                            } else {
                              mraidSetup();
                            }
                          }

                          function mraidSetup() {
                            mraid.addEventListener(
                              "stateChange",
                              function() {
                                if (
                                  mraid.getState() ===
                                  "default"
                                ) {
                                  div.style.display =
                                    "block";
                                } else {
                                  div.style.display =
                                    "none";
                                }
                              }
                            );
                          }
                          //
                          if (BAP.options[pageId].dm === 5) { 
                            // iframe containing durly
                            div.innerHTML = div.innerHTML + icon;
                            setTimeout(positionDM3(pageId),1000);
                          } else  {
                            try {
                              var ad_css_position = getComputedStyle(BAP.options[pageId].ad).position;
                              if (isNonTimerDm(BAP.options[pageId].dm) && (ad_css_position === 'relative' || ad_css_position === 'absolute')) {
                                appenIconToAd(pageId, icon);
                              } else {
                                div.innerHTML = div.innerHTML + icon;
                              }
                            } catch (e) {
                              div.innerHTML = div.innerHTML + icon;
                            }
                          }
                          //
                        }

                        function appenIconToAd(pageId, icon){
                          var _iconDomElement =  $("BAP-icon-"+ BAP.options[pageId].ad.notice);
                          if (!_iconDomElement) {
                            _iconDomElement = document.createElement('div');
                            _iconDomElement.innerHTML += icon;
                            try {
                              _iconDomElement.setAttribute("id", "BAP-icon-"+ BAP.options[pageId].ad.notice);
                            } catch(e) {
                              console.warn(e.message)
                            }
                          }
                          BAP.options[pageId].ad.appendChild(_iconDomElement);
                          setTimeout(positionDM3(pageId),1000);
                        }
                    
                        function positionDM3(pageId){
                          $("trigger-" + pageId).style.top = 'unset';
                    
                          $("trigger-" + pageId).style.left = 'unset';
                    
                          $("trigger-" + pageId).style.right = 'unset';
                          $("trigger-" + pageId).style.bottom = 'unset';
                          
                          $("trigger-" + pageId).style.position = 'absolute';
                    
                          var _nudgeY = BAP.options[pageId].offsetTop + 'px';
                          var _nudgeX = BAP.options[pageId].offsetLeft + 'px';
                    
                          if (BAP.options[pageId].position === 'top-left') {
                            $("trigger-" + pageId).style.top = _nudgeY;
                            $("trigger-" + pageId).style.left = _nudgeX;
                          } else if (BAP.options[pageId].position === 'top-right') {
                            $("trigger-" + pageId).style.top = _nudgeY;
                            $("trigger-" + pageId).style.right = _nudgeX;
                          } else if (BAP.options[pageId].position === 'bottom-left') {
                            $("trigger-" + pageId).style.bottom = _nudgeY;
                            $("trigger-" + pageId).style.left = _nudgeX;
                          } else if (BAP.options[pageId].position === 'bottom-right') {
                            $("trigger-" + pageId).style.bottom = _nudgeY;
                            $("trigger-" + pageId).style.right = _nudgeX;
                          }
                        }

                        function showNoticeHelper(pageId) {
                          // noticeMode is moved into process.
                          noticePositionCalculate(pageId);
                          noticeVerification(pageId);
                          if (!BAP.options[pageId].noticeExists) {
                            noticeCreate(pageId);
                            noticePosition(pageId);
                            BAPUtil.trace("Generated the following notice: " + pageId + " (" + nids[pageId] + ") h:" + BAP.options[pageId].ad_h + " w:" + BAP.options[pageId].ad_w + " t:" + BAP.options[pageId].spotTop + " l:" + BAP.options[pageId].spotLeft + " pt:" + BAP.options[pageId].pxt + " pl:" + BAP.options[pageId].pxl + " mode:" + BAP.options[pageId].dm);
                            addNoticeDelay(pageId);
                          } else {
                            BAPUtil.trace("Notice already exists for: " + pageId);
                            // log L1 shown for same page overwrite
                            action(pageId, "I");
                            // log overwrite
                            action(pageId, "O");
                          }
                        }
                        /**
                         * This method figures out if a covering notice needs to accept the incoming notice
                         * and add it into coverage stack for itself.
                         */
                        function coverNotice(coverBy, covered, o) {
                          var c = o ? covered : nids[covered];
                          // if covering notice is the same nid, do not add into the coveredNotice stack
                          if (nids[coverBy] === c) {
                            return;
                          }
                          // now check if the same notice is in the covered stack already
                          if (coveredNotices[coverBy]) {
                            for (var key in coveredNotices[coverBy]) {
                              if (key === c) {
                                return;
                              }
                            }
                          }
                          // made it through, so this is a new notice, add into coverage
                          coveredNotices[coverBy][c] = o || BAP.options[covered];
                        }
                        /**
                         * Helper for string creation used in compose messages
                         */
                        function acceptMessageString(options, nid) {
                          return "BAPACCEPT|" + nid + "|" + options.nid + "|" + (options.aid || 0) + "|" + (options.icaid || 0) + "|" + (options.ecaid || 0) + "|" + options.coid + "|" + options.ad_w + "|" + options.ad_h + "|" + options.rev + "|" + (options.cps || "-") + "|" + (options.seg || "-");
                        }
                        /**
                         * Helper method to shorten BAPACCEPT message execution
                         */
                        function composeAcceptMessage(options, nid, w) {
                          postNoticeMessage(acceptMessageString(options, nid), w);
                        }

                        function postNoticeMessage(m, d) {
                          var win;
                          if (d) {
                            if (d["postMessage"]) {
                              win = d;
                            } else {
                              win = d.contentWindow;
                            }
                          } else {
                            win = window.parent;
                          }
                          if (win.postMessage) {
                            win.postMessage(m, "*");
                          }
                        }

                        function flashPostMessage(m) {
                          handleMessage({ data: m });
                        }
                        /**
                         * This function grabs all iframes on the page and sends a dance
                         * request to them.  Each frame is also marked with the id (loop)
                         * for unique identification.
                         */
                        function tango() {
                          var frames = document.getElementsByTagName("iframe");
                          for (var i = 0; i < frames.length; i++) {
                            tangoPartners[i] = frames[i];
                            postNoticeMessage("BAPTANGO?|" + i, frames[i]);
                          }
                        }
                        /**
                         * Queue support for messaging since its possible to receive a message prior to tag processing.
                         * When this occurs, message is queued in BAP.mq and processed when the current payload is complete.
                         * TODO: potentially might execute several times for multiple messages received -- maintain order
                         * of received messages?
                         */
                        function handleMessageQueue() {
                          if (rendered && mq.length > 0) {
                            var i,
                              rev = [];
                            // Pulling broadcasts and adding as last message.
                            for (i = 0; i < mq.length; i++) {
                              if (mq[i].indexOf("BAPFRAMEBROADCAST") >= 0) {
                                rev.push(mq[i]);
                              }
                            }
                            while (mq.length > 0) {
                              i = mq.pop();
                              if (i.indexOf("BAPFRAMEBROADCAST") >= 0) {
                                continue;
                              }
                              rev.push(i);
                            }
                            while (mq.length > 0) {
                              rev.push(mq.pop());
                            }
                            while (rev.length > 0) {
                              handleMessage(rev.pop());
                            }
                          } else if (!rendered && mq.length > 0) {
                            setTimeout(handleMessageQueue, 1000);
                          }
                        }

                        function handleMessage(e) {
                          try {
                            var f,
                              trigger,
                              r,
                              nid,
                              ad,
                              div,
                              data = e;
                            if (e.data) {
                              data = e.data;
                            }
                            /* Race condition: its possible to receive message before tag is processed on the parent page. */
                            if (!rendered) {
                              BAPUtil.trace("Message queued: " + data);
                              mq.push(data);
                              setTimeout(handleMessageQueue, 1000);
                              return;
                            }
                            BAPUtil.trace("Message received: " + data + " at " + document.location);
                            var message = data.substring(0, data.indexOf("|") || data.length);
                            if (message === "BAPFRAMEBROADCAST") {
                              // Handling of the notice at the actual page.
                              if (window.top === window) {
                                r = data.split("|");
                                nid = r[1];
                                var ref = r[2],
                                  w = r[3],
                                  h = r[4];
                                for (var pageId in BAP.options) {
                                  ad = BAP.options[pageId].ad;
                                  if (ad && ad.nodeName === "IFRAME" && BAP.options[pageId].ad_h === h && BAP.options[pageId].ad_w === w) {
                                    /**
                                     * Special referrer match.  Only happens if iframe and inner frame are separated by a single frame.
                                     * More accuratte then other assumption.
                                     */
                                    if (ref === ad.src || (browser.IE && ref.indexOf(ad.src) > 0)) {
                                      composeAcceptMessage(BAP.options[pageId], nid, e.source);
                                      // log overwrite
                                      // logging overwrite for everything but IE.
                                      if (!browser.IE) {
                                        action(pageId, "O");
                                      }
                                      // remove trigger
                                      div = $("BAP-holder");
                                      trigger = $("trigger-" + pageId);
                                      if (trigger) {
                                        div.removeChild($("trigger-container-" + pageId));
                                      }
                                      // remove from options
                                      delete BAP.options[pageId];
                                      break;
                                    }
                                  }
                                }
                              }
                            } else if (message === "BAPFRAMEID") {
                              // Rhumba case! (attempting a reverse tango) -- this case occurs when the frame has loaded after parent requested tango partners.
                              r = data.split("|");
                              nid = r[1];
                              var frameUrl = r[2],
                                frames = document.getElementsByTagName("iframe");
                              for (var i = 0; i < frames.length; i++) {
                                if (frames[i].src && frames[i].src === frameUrl) {
                                  tangoPartners[i] = frames[i];
                                  postNoticeMessage("BAPTANGO?|" + i, frames[i]);
                                }
                              }
                            } else if (message === "BAPTANGO?") {
                              // Dance request!
                              var id = data.substring(data.indexOf("|") + 1);
                              window.bap_frameid = id;
                              postNoticeMessage("BAPLETSDANCE|" + id);
                              if (window.notice) {
                                postNoticeMessage("BAPFRAME|" + nids[window.notice] + "|" + id);
                              }
                            } else if (message === "BAPLETSDANCE") {
                              // Dance accepted!
                              f = data.substring(data.indexOf("|") + 1);
                              tangoPartners[f].tango = f;
                            } else if (message === "BAPFRAME") {
                              /**
                               * Bubbling up the frame stack receiver.  When message arrives, checks if this (current)
                               * level contains the notice, and then removes if from the displaying if it exist in
                               * this level.
                               */
                              r = data.split("|");
                              nid = r[1];
                              var frameId = r[2];
                              frameNoticed[url] = nid;
                              frameNoticed.contents = true;
                              for (pageId in BAP.options) {
                                ad = BAP.options[pageId].ad;
                                if ((ad && (ad.nodeName === "IFRAME" && ad.tango === frameId && !BAP.options[pageId].noticeExists)) || ad.nodeName === "EXACT-FRAME") {
                                  // notify that there is a match in the stack and alert for the covered nid
                                  var pass = "";
                                  if (ad.nodeName === "EXACT-FRAME") {
                                    // the notice is an exact frame, but appears to be a pass through frame itself.
                                    // in this case, find and notify the deeper frame of itself
                                    // NOTE: perphaps just assume that in a pass-through scenario there will be a single iframe to post to?
                                    frames = document.getElementsByTagName("iframe");
                                    for (var j = 0; j < frames.length; j++) {
                                      composeAcceptMessage(BAP.options[pageId], nid, frames[j]);
                                      // anchor the slave frame
                                      window.passFrame = frames[j];
                                    }
                                  } else {
                                    composeAcceptMessage(BAP.options[pageId], nid, ad);
                                    // anchor the slave frame
                                    pass = ad;
                                  }
                                  window.passNid = nid;
                                  // if current notice covers any other notices, pass them as well
                                  for (var key in coveredNotices[pageId]) {
                                    composeAcceptMessage(coveredNotices[pageId][key], nid, pass || window.passFrame);
                                  }
                                  // log overwrite
                                  action(pageId, "O");
                                  // remove trigger
                                  (div = $("BAP-holder")), (trigger = $("trigger-" + pageId));
                                  if (trigger) {
                                    div.removeChild($("trigger-container-" + pageId));
                                  }
                                  // remove from options
                                  delete BAP.options[pageId];
                                  // no need to continue iterating, dance partners are unique
                                  break;
                                }
                              }
                            } else if (message === "BAPFLASH") {
                              /**
                               * Bubbling up the frame stack receiver.  When message arrives, checks if this (current)
                               * level contains the notice, and then removes if from the displaying if it exist in
                               * this level.
                               */
                              r = data.substring(data.indexOf("|") + 1);
                              nid = r.substring(0, r.indexOf("|"));
                              var url = r.substring(r.indexOf("|") + 1);
                              for (pageId in BAP.options) {
                                ad = BAP.options[pageId].ad;
                                if ((ad && ((ad.nodeName === "OBJECT" || ad.nodeName === "EMBED") && ad.data === url && !BAP.options[pageId].noticeExists)) || ad.nodeName === "EXACT-FRAME") {
                                  // notify that there is a match in the stack and alert for the covered nid
                                  try {
                                    ad.flashGetMessage(acceptMessageString(BAP.options[pageId], nid));
                                  } catch (e) {}
                                  // anchor the slave frame
                                  window.passFrame = ad;
                                  window.passNid = nid;
                                  // if current notice covers any other notices, pass them as well
                                  for (var key in coveredNotices[pageId]) {
                                    try {
                                      ad.flashGetMessage(acceptMessageString(BAP.options[pageId], nid));
                                    } catch (e) {}
                                  }
                                  // log overwrite
                                  action(pageId, "O");
                                  // remove trigger
                                  div = $("BAP-holder");
                                  trigger = $("trigger-" + pageId);
                                  if (trigger) {
                                    div.removeChild($("trigger-container-" + pageId));
                                  }
                                  // remove from options
                                  delete BAP.options[pageId];
                                }
                              }
                            } else if (message === "BAPACCEPT") {
                              /**
                               * Bubbling down the frame stack receiver when a match occurs in higher frames to append
                               * the notice id to the appropriate display level.
                               */
                              r = data.split("|");
                              var op = {},
                                enid = r[1];
                              op.nid = r[2];
                              op.aid = r[3];
                              op.icaid = r[4];
                              op.ecaid = r[5];
                              op.coid = r[6];
                              op.ad_w = r[7];
                              op.pixel_ad_w = r[7];
                              op.pixel_ad_h = r[8];
                              op.ad_h = r[8];
                              op.rev = r[9];
                              if (r[10] && r[10] !== "-") {
                                op.cps = r[10];
                              }
                              if (r[12] && r[11] !== "-") {
                                op.seg = r[11];
                              }
                              if (op.ecaid === 0) {
                                delete op.ecaid;
                              }
                              if (window.passFrame) {
                                BAPUtil.trace("Pass-through frame in the stack. Executing pass: " + op.nid + " to " + window.passNid);
                                composeAcceptMessage(op, window.passNid, window.passFrame);
                              } else {
                                for (pageId in BAP.options) {
                                  var _nid = nids[pageId];
                                  if (enid === _nid) {
                                    BAPUtil.trace("Coverage accepted by: " + enid + " covering: " + op.nid);
                                    coverNotice(pageId, op.nid, op);
                                  }
                                }
                              }
                            } else if (message === "BAPPING") {
                              /**
                               * This is a generic heartbeat and message transfer API.
                               */
                              r = "";
                              if (window.notice) {
                                r = "BAPPONG|" + BAP.options[window.notice].position;
                                postNoticeMessage(r);
                              } else if (window.passFrame) {
                                postNoticeMessage("BAPPING|", window.passFrame);
                              }
                            } else if (message === "BAPPONG") {
                              /**
                               * Would only ever receive this when acting as a pass-through frame, so just bubble further up.
                               */
                              postNoticeMessage(data);
                            }
                          } catch (er) {
                            BAPUtil.trace("[handleMessage() error]", er.message);
                          }
                        }

                        function updateL2(pageId) {
                          var popup = $("bap-notice-" + pageId),
                            l;
                          if (BAP.options[pageId].positionHorizontal() === "right") {
                            try {
                              l = BAP.options[pageId].spotLeft + BAP.options[pageId].ad_w - BAP.options[pageId].popupWidth;
                              popup.style.left = (l || 0) + "px";
                            } catch (e) {}
                          } else {
                            popup.style.left = (BAP.options[pageId].spotLeft || 0) + "px";
                          }
                          if (BAP.options[pageId].positionVertical() === "top") {
                            popup.style.top = BAP.options[pageId].posTop + "px";
                          } else {
                            l = parseInt(popup.style["height"]) || BAP.options[pageId].popupHeight;
                            popup.style.top = (BAP.options[pageId].spotTop + BAP.options[pageId].ad_h - l > 0 ? BAP.options[pageId].spotTop + BAP.options[pageId].ad_h - l : 0) + "px";
                          }
                          if (browser.IE && browser.QuirksMode && BAP.options[pageId].popupWidth && popup.style.display !== "none") {
                            popup.style.display = "block";
                            var add = BAP.options[pageId].popupWidth === 728 ? 4 : 0;
                            popup.style.width = BAP.options[pageId].popupWidth + add + "px";
                            popup.style.margin = "0px 0px";
                          }
                          // adding on-demand logo load.
                          l = BAP.options[pageId].advLogo;
                          if ($("bap-logo-" + pageId) && l && popup.style.display !== "none" && !$("bap-logo-" + pageId).src) {
                            $("bap-logo-" + pageId).src = l;
                            BAPUtil.trace("[updateL2] loaded logo");
                          }
                        }
                        /* Offset copy. */
                        var _boxModel = null;
                        (function() {
                          var div = document.createElement("div");
                          div.style.width = div.style.paddingLeft = "1px";
                          body.appendChild(div);
                          _boxModel = div.offsetWidth === 2;
                          body.removeChild(div).style.display = "none";
                        })();

                        function _bodyOffset() {
                          var top = body.offsetTop,
                            left = body.offsetLeft;
                          var container = document.createElement("div"),
                            innerDiv,
                            checkDiv,
                            // table,
                            //td,
                            bodyMarginTop = parseFloat(getStyle(body, "marginTop")) || 0,
                            html = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';
                          container.style.position = "absolute";
                          container.style.top = 0;
                          container.style.left = 0;
                          container.style.margin = 0;
                          container.style.border = 0;
                          container.style.width = "1px";
                          container.style.height = "1px";
                          container.style.visibility = "hidden";
                          container.innerHTML = html;
                          body.insertBefore(container, body.firstChild);
                          innerDiv = container.firstChild;
                          checkDiv = innerDiv.firstChild;
                          //td = innerDiv.nextSibling.firstChild.firstChild;
                          checkDiv.style.position = "fixed";
                          checkDiv.style.top = "20px";
                          // safari subtracts parent border width here which is 5px
                          checkDiv.style.position = checkDiv.style.top = "";
                          innerDiv.style.overflow = "hidden";
                          innerDiv.style.position = "relative";
                          body.removeChild(container);
                          //container = innerDiv = checkDiv = table = td = null;
                          container = innerDiv = checkDiv = null;
                          if (body.offsetTop !== bodyMarginTop) {
                            top += parseFloat(getStyle(body, "marginTop")) || 0;
                            left += parseFloat(getStyle(body, "marginLeft")) || 0;
                          }
                          return { top: top, left: left };
                        }

                        function _offset(elem) {
                          var box;
                          if (!elem || !elem.ownerDocument) {
                            return null;
                          }
                          if (elem === elem.ownerDocument.body) {
                            return _bodyOffset(elem);
                          }
                          try {
                            box = elem.getBoundingClientRect();
                          } catch (e) {}
                          var doc = elem.ownerDocument,
                            docElem = doc.documentElement;
                          // Make sure we're not dealing with a disconnected DOM node
                          if (!box) {
                            return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
                          }
                          var body = doc.body,
                            win = elem && typeof elem === "object" && "setInterval" in elem ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false,
                            clientTop = docElem.clientTop || (browser.IE && browser.QuirksMode ? body.clientTop : 0) || 0 /* clientTop = docElem.clientTop || body.clientTop || 0, */,
                            clientLeft = docElem.clientLeft || (browser.IE && browser.QuirksMode ? body.clientLeft : 0) || 0 /* clientLeft = docElem.clientLeft || body.clientLeft || 0, */,
                            scrollTop = win.pageYOffset || (_boxModel && docElem.scrollTop) || body.scrollTop,
                            scrollLeft = win.pageXOffset || (_boxModel && docElem.scrollLeft) || body.scrollLeft,
                            top = box.top + scrollTop - clientTop,
                            left = box.left + scrollLeft - clientLeft;
                          return { top: top, left: left };
                        }

                        BAP.changePosition = function(arg1, position, offsetObj){
                            var ad, pageId,
                              _x, _y,
                              _changeFlag = false;
                            if (isElement(arg1)){
                              el = arg1;
                            } else if (typeof arg1 === 'string') {
                              el = document.querySelector(arg1);
                            } else {
                              console.warn('invalid dom argument. Send dom element or string')
                              return;
                            }
                            Object.keys(BAP.options).forEach(key => {
                              if (BAP.options[key].ad === el) {
                                pageId = key;
                              }
                              //use key and value here
                            });
                      
                            if (position === 'top-left' || position === 'top-right' || position === 'bottom-left' || position === 'bottom-right' || _x) {
                              if (BAP.options[pageId].position !== position) {
                                // new position
                                BAP.options[pageId].position = position;
                                //swap out background art of icon
                                $("trigger-" + pageId).querySelector('img').src="http://dev.betrad.com/icon/box_77_" + position + ".png";
                                _changeFlag = true;
                              }
                            } else {
                              console.warn('invalid icon position request');
                            }
                      
                            if (offsetObj.x) { 
                              _x = parseInt(offsetObj.x, 10);
                              if (BAP.options[pageId].offsetLeft !== _x  )  {
                                BAP.options[pageId].offsetLeft = _x;
                                _changeFlag = true;
                              }
                            }
                            if (offsetObj.y) { 
                              _y = parseInt(offsetObj.y, 10);
                              if (BAP.options[pageId].offsetTop !== _y  )  {
                                BAP.options[pageId].offsetTop = _y;
                                _changeFlag = true;
                              }
                            }
                            if (_changeFlag) positionDM3(pageId);
                            noticePositionCalculate(pageId);
                        };

                        function isElement(obj) {
                            try {
                              //Using W3 DOM2 (works for FF, Opera and Chrome)
                              return obj instanceof HTMLElement;
                            }
                            catch(e){
                              //Browsers not supporting W3 DOM2 don't have HTMLElement and
                              //an exception is thrown and we end up here. Testing some
                              //properties that all elements have (works on IE7)
                              return (typeof obj==="object") &&
                                (obj.nodeType===1) && (typeof obj.style === "object") &&
                                (typeof obj.ownerDocument ==="object");
                            }
                          }


                        try {
                          addEvent(window, "message", handleMessage);
                        } catch (e) {}
                        // BAP utilities class
                        var BAPUtil = { /* NON_PROD */
                          trace: function() {
                            /* NON_PROD */
                            try {
                              /* NON_PROD */
                              if (arguments.length >= 1 || arguments.length <= 3) {
                                /* NON_PROD */
                                var format = "-- BAP" + (window === window.top ? "" : " [" + document.location.href + "]") + ":  " + arguments[0]; /* NON_PROD */
                                if (arguments.length === 1) console.log(format);
                                else if (arguments.length === 2) /* NON_PROD */
                                  console.log(format, arguments[1]);
                                else if (arguments.length === 3) /* NON_PROD */
                                  console.log(format, arguments[1], arguments[2]); /* NON_PROD */
                              } else {
                                /* NON_PROD */
                                alert("Improper use of trace(): " + arguments.length + " arguments"); /* NON_PROD */
                              } /* NON_PROD */
                            } catch (e) {} /* NON_PROD */
                          } /* NON_PROD */ }; /* NON_PROD */
                        // _bao options loaded for DFA.
                        if (window._bao) {
                          start(window._bao);
                        }
                        API.changePosition = BAP.changePosition;
                        API.options = BAP.options;
                        API.flashPostMessage = flashPostMessage;
                        API.toggle = toggle;
                        API.expandIcon = expandIcon;
                        API.collapseIcon = collapseIcon;
                        API.action = action;
                        API.start = start;
                        API.copyJSON = copyJSON;
                        API.closeOverlay = closeOverlay;
                        API.gotoL3 = gotoL3;
                        API.$ = $;
                        return API;
                      })();
